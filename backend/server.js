require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const authRoutes = require('./routes/auth.routes');
const salonRoutes = require('./routes/salon.routes');
const serviceRoutes = require('./routes/service.routes');
const barberRoutes = require('./routes/barber.routes');
const appointmentRoutes = require('./routes/appointment.routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/salons', salonRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api', barberRoutes);
app.use('/api/appointments', appointmentRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ message: err.message || 'Szerverhiba' });
});

if (require.main === module) {
    app.listen(PORT, () => console.log(`BladeRunner API listening on port ${PORT}`));
}

module.exports = app;
