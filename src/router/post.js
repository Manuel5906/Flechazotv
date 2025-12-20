import { Router } from 'express'

const router = Router()

// ==========================================
// RUTA: /post/ia-predict
// ==========================================
// Nota: El prefijo '/post' ya lo pusiste en server.js
router.post('/ia-predict', (req, res) => {
    const { entrada } = req.body;
    
    // Validación básica
    if (!entrada) {
        return res.status(400).json({ error: "No enviaste datos" })
    }

    console.log("Recibido en POST:", entrada)

    // Aquí iría tu lógica matemática de IA más adelante
    res.json({ 
        mensaje: "Cálculo realizado", 
        resultado: `La IA procesó: ${entrada}` 
    });
})

export default router
