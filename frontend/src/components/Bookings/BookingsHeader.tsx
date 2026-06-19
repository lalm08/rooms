import { Typography } from "@mui/material";
import AddOutlined from "@mui/icons-material/AddOutlined";

type Props = {
  onNewBooking: () => void;
};

export function BookingsHeader({ onNewBooking }: Props) {
  return (
    <header className="catalog-page-header">
      <div>
        <Typography variant="h5" fontWeight={700} color="#11181c">
          Управление бронированием
        </Typography>
        <Typography variant="body2" color="#6b7280" mt={0.5}>
          Создавайте, изменяйте и отслеживайте бронирования аудиторий
        </Typography>
      </div>

      <div className="catalog-page-header-actions">
        <button type="button" className="header-btn primary" onClick={onNewBooking}>
          <AddOutlined fontSize="small" />
          Новое бронирование
        </button>
      </div>
    </header>
  );
}
