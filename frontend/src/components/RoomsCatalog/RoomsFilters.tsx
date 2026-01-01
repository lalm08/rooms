import { Paper, TextField, Typography } from "@mui/material";

function RoomsFilters() {
  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: "1px solid #e0e0e0" }}>
      <Typography fontWeight={600} mb={2}>Фильтры и поиск</Typography>
      
      <div className="filters-row">
        <TextField placeholder="Поиск по номеру или названию..." size="small" sx={{ minWidth: 320 }} />
        <select className="filter-select"><option>Все корпуса</option></select>
        <select className="filter-select"><option>Все этажи</option></select>
        <select className="filter-select"><option>Все статусы</option></select>
        <button className="btn-text">Сбросить все</button>
      </div>

      <div className="equipment-tags">
        {["Проектор", "Компьютеры", "Интерактивная доска", "Микрофон", "Wi-Fi"].map(tag => (
          <span key={tag} className="equip-tag">{tag}</span>
        ))}
      </div>
    </Paper>
  );
}
export default RoomsFilters;