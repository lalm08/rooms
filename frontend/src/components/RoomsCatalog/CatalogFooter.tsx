import { Stack } from "@mui/material";

function CatalogFooter() {
  return (
    <footer className="catalog-footer">
      <span className="catalog-footer-title">Нужна помощь?</span>
      <Stack direction="row" className="catalog-footer-actions">
        <button type="button" className="header-btn outline">
          Документация
        </button>
        <button type="button" className="header-btn primary">
          Связаться с поддержкой
        </button>
      </Stack>
    </footer>
  );
}

export default CatalogFooter;
