// block.json API
import { addToBlocklist, removeFromBlocklist, loadBlocklist } from '../pipeline/block-check.js';
import { settings } from '../../config/settings.js';

export function blockApiRoutes(app) {
  app.get('/api/block', (req, res) => {
    try {
      loadBlocklist(settings.SECURITY_BLOCKLIST_PATH);
      res.status(200).json({ success: true });
    } catch (қате) {
      res.status(500).json({ error: 'Блоктізім қатесі' });
    }
  });

  app.post('/api/block', (req, res) => {
    try {
      const { phone } = req.body;
      const нәтиже = addToBlocklist(phone, settings.SECURITY_BLOCKLIST_PATH);
      res.status(200).json({ success: нәтиже });
    } catch (қате) {
      res.status(500).json({ error: 'Блоктау қатесі' });
    }
  });

  app.delete('/api/block/:phone', (req, res) => {
    try {
      const phone = req.params.phone;
      const нәтиже = removeFromBlocklist(phone, settings.SECURITY_BLOCKLIST_PATH);
      res.status(200).json({ success: нәтиже });
    } catch (қате) {
      res.status(500).json({ error: 'Блоктан шығару қатесі' });
    }
  });
}
