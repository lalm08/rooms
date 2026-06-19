const VALID_STATUS = new Set(['available', 'booked', 'maintenance']);
/** Синонимы: ключ фильтра / имя из справочника устройств → значения в auditory.equipment[] */
const EQUIPMENT_ALIASES = {
    projector: ['projector', 'проектор', 'Проектор'],
    computers: ['computers', 'компьютер', 'компьютеры', 'Компьютеры'],
    board: ['board', 'доска', 'Доска', 'интерактивная доска', 'Интерактивная доска'],
    microphone: ['microphone', 'микрофон', 'Микрофон'],
    wifi: ['wifi', 'Wi-Fi', 'wi-fi', 'Wi Fi'],
};
function expandEquipmentValues(tag) {
    const direct = EQUIPMENT_ALIASES[tag.toLowerCase()];
    if (direct)
        return direct;
    for (const values of Object.values(EQUIPMENT_ALIASES)) {
        if (values.some((v) => v.toLowerCase() === tag.toLowerCase())) {
            return values;
        }
    }
    return [tag];
}
export function toRoomDto(a) {
    const status = VALID_STATUS.has(a.status)
        ? a.status
        : 'available';
    return {
        id: a.id,
        code: a.code,
        name: a.name,
        description: a.description,
        capacity: a.capacity,
        building: a.building,
        floor: a.floor,
        equipment: a.equipment,
        status,
    };
}
export function buildRoomsWhere(query) {
    const where = {};
    if (query.search?.trim()) {
        const q = query.search.trim();
        where.OR = [
            { code: { contains: q, mode: 'insensitive' } },
            { name: { contains: q, mode: 'insensitive' } },
        ];
    }
    if (query.building) {
        where.building = query.building;
    }
    if (query.floor) {
        where.floor = query.floor;
    }
    if (query.status) {
        where.status = query.status;
    }
    if (query.equipment) {
        const tags = query.equipment.split(',').map((t) => t.trim()).filter(Boolean);
        const equipConditions = tags.map((tag) => ({
            equipment: { hasSome: expandEquipmentValues(tag) },
        }));
        if (equipConditions.length === 1) {
            Object.assign(where, equipConditions[0]);
        }
        else if (equipConditions.length > 1) {
            const prevAnd = where.AND
                ? Array.isArray(where.AND) ? where.AND : [where.AND]
                : [];
            where.AND = [...prevAnd, ...equipConditions];
        }
    }
    return where;
}
export async function getRoomsStats(prisma) {
    const [total, available, booked, rooms] = await Promise.all([
        prisma.auditory.count(),
        prisma.auditory.count({ where: { status: 'available' } }),
        prisma.auditory.count({ where: { status: 'booked' } }),
        prisma.auditory.findMany({ select: { equipment: true } }),
    ]);
    const equipmentUnits = rooms.reduce((sum, r) => sum + r.equipment.length, 0);
    return { total, available, booked, equipmentUnits };
}
const EQUIPMENT_LABELS = {
    projector: 'Проекторы',
    computers: 'Компьютеры',
    board: 'Интеракт. доски',
    microphone: 'Микрофоны',
    camera: 'Камеры',
    ac: 'Кондиционеры',
};
export async function getEquipmentOverview(prisma) {
    const rooms = await prisma.auditory.findMany({ select: { equipment: true } });
    const counts = {};
    for (const room of rooms) {
        for (const key of room.equipment) {
            counts[key] = (counts[key] ?? 0) + 1;
        }
    }
    const order = ['projector', 'computers', 'board', 'microphone', 'camera', 'ac'];
    return order
        .filter((key) => counts[key])
        .map((key) => ({
        key,
        label: EQUIPMENT_LABELS[key] ?? key,
        count: counts[key],
    }));
}
export async function getBuildingSchema(prisma, building = 'Главный корпус') {
    const rooms = await prisma.auditory.findMany({
        where: { building },
        orderBy: [{ floor: 'desc' }, { code: 'asc' }],
        select: { code: true, floor: true, status: true },
    });
    const floorMap = new Map();
    for (const room of rooms) {
        const status = VALID_STATUS.has(room.status)
            ? room.status
            : 'available';
        const list = floorMap.get(room.floor) ?? [];
        list.push({ code: room.code, status });
        floorMap.set(room.floor, list);
    }
    const floors = [...floorMap.entries()]
        .sort(([a], [b]) => b - a)
        .map(([floor, floorRooms]) => ({
        floor,
        rooms: floorRooms,
        available: floorRooms.filter((r) => r.status === 'available').length,
        total: floorRooms.length,
    }));
    return { building, floors };
}
export async function getRecentActivity(prisma) {
    const [rooms, bookings] = await Promise.all([
        prisma.auditory.findMany({
            orderBy: { updatedAt: 'desc' },
            take: 5,
            select: { code: true, name: true, updatedAt: true, createdAt: true },
        }),
        prisma.booking.findMany({
            orderBy: { updatedAt: 'desc' },
            take: 5,
            include: { auditory: { select: { code: true } } },
        }),
    ]);
    const events = [];
    for (const room of rooms) {
        const isNew = room.createdAt.getTime() === room.updatedAt.getTime();
        events.push({
            type: isNew ? 'add' : 'edit',
            text: isNew
                ? `Добавлена аудитория ${room.code}`
                : `Обновлена аудитория ${room.code}`,
            at: room.updatedAt,
        });
    }
    for (const booking of bookings) {
        const label = booking.title || booking.auditory.code;
        events.push({
            type: 'booking',
            text: `Бронирование «${label}» — аудитория ${booking.auditory.code}`,
            at: booking.updatedAt,
        });
    }
    return events
        .sort((a, b) => b.at.getTime() - a.at.getTime())
        .slice(0, 5)
        .map((e) => ({
        type: e.type,
        text: e.text,
        at: e.at.toISOString(),
    }));
}
//# sourceMappingURL=rooms.js.map