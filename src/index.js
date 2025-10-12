import dotenv from 'dotenv';
import { app } from './app.js';


import connectDB from './db/index.js';

dotenv.config();

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 3000, () => {
            console.log(`🚀 Server running on port ${process.env.PORT || 3000}`);
            app.on('error', (err) => {
                console.error('Server error:', err);
                throw err;

            })
        });
        
})
    .catch((err) => {
        console.error('Failed to connect to the database:', err);
        process.exit(1);
    });



