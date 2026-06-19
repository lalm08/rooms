import { Container, Paper, Typography, Box } from "@mui/material";
import EventNoteOutlined from "@mui/icons-material/EventNoteOutlined";

export function BookingsPlaceholder() {
  return (
    <Container maxWidth="sm" sx={{ mt: 10, mb: 6 }}>
      <Paper
        elevation={0}
        sx={{
          p: 5,
          textAlign: "center",
          borderRadius: 3,
          border: "1px solid #e2e8f0",
        }}
      >
        <Box sx={{ color: "#94a3b8", mb: 2 }}>
          <EventNoteOutlined sx={{ fontSize: 48 }} />
        </Box>
        <Typography variant="h5" fontWeight={700} mb={1}>
          Управление бронированием
        </Typography>
        <Typography color="text.secondary">
          Раздел в разработке. Скоро здесь появится календарь и список бронирований.
        </Typography>
      </Paper>
    </Container>
  );
}
