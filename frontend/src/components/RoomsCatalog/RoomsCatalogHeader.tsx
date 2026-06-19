import { Typography } from "@mui/material";
import FileUploadOutlined from "@mui/icons-material/FileUploadOutlined";
import FileDownloadOutlined from "@mui/icons-material/FileDownloadOutlined";
import AddOutlined from "@mui/icons-material/AddOutlined";

function RoomsCatalogHeader() {
  return (
    <header className="catalog-page-header">
      <div>
        <Typography variant="h5" fontWeight={700} color="#11181c">
          Каталог аудиторий
        </Typography>
        <Typography variant="body2" color="#6b7280" mt={0.5}>
          Управляйте информацией об аудиториях, их оборудованием и местоположением
        </Typography>
      </div>

      <div className="catalog-page-header-actions">
        <button type="button" className="header-btn outline">
          <FileDownloadOutlined fontSize="small" />
          Экспорт JSON
        </button>
        <button type="button" className="header-btn outline">
          <FileUploadOutlined fontSize="small" />
          Импорт JSON
        </button>
        <button type="button" className="header-btn primary">
          <AddOutlined fontSize="small" />
          Добавить аудиторию
        </button>
      </div>
    </header>
  );
}

export default RoomsCatalogHeader;
