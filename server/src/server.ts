import app from "./app.js";
import config from "./config/config.js";
import startDB from "./db.js";

startDB(app)
  .then(() => {
    app.listen(config.port, () => {
      console.log(`✅ Datenbank verbunden.`);
      console.log(`🚀 Server running on port ${config.port}`);
    });
  })
  .catch((err) => {
    console.error("❌ Fehler beim Starten der Datenbank:", err);
    process.exit(1);
  });
