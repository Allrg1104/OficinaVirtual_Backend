const { IpsRepository } = require('../repositories/IpsRepository');
const ipsRepo = new IpsRepository();

class IpsController {
  list = async (req, res, next) => {
    try {
      const onlyActive = req.query.onlyActive === 'true';
      const filter = onlyActive ? { active: true } : {};
      const list = await ipsRepo.find(filter, { sort: { code: 1 } });
      return res.json(list);
    } catch (error) {
      next(error);
    }
  };

  create = async (req, res, next) => {
    try {
      const { code, name, abbreviation } = req.body;
      if (!code || !name || !abbreviation) {
        return res.status(400).json({ message: 'El código, nombre y abreviación son requeridos' });
      }
      const existing = await ipsRepo.findOne({
        $or: [{ code: code.trim() }, { name: name.trim() }]
      });
      if (existing) {
        return res.status(400).json({ message: 'La IPS ya existe (código o nombre duplicado)' });
      }
      const created = await ipsRepo.create({
        code: code.trim(),
        name: name.trim(),
        abbreviation: abbreviation.trim()
      });
      return res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { code, name, abbreviation, active } = req.body;
      const updateData = {};
      if (code !== undefined) updateData.code = code.trim();
      if (name !== undefined) updateData.name = name.trim();
      if (abbreviation !== undefined) updateData.abbreviation = abbreviation.trim();
      if (active !== undefined) updateData.active = Boolean(active);

      const updated = await ipsRepo.update(id, updateData);
      if (!updated) {
        return res.status(404).json({ message: 'IPS no encontrada' });
      }
      return res.json(updated);
    } catch (error) {
      next(error);
    }
  };

  toggleStatus = async (req, res, next) => {
    try {
      const { id } = req.params;
      const ips = await ipsRepo.findById(id);
      if (!ips) {
        return res.status(404).json({ message: 'IPS no encontrada' });
      }
      ips.active = !ips.active;
      await ips.save();
      return res.json(ips);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req, res, next) => {
    try {
      const { id } = req.params;
      const deleted = await ipsRepo.delete(id);
      if (!deleted) {
        return res.status(404).json({ message: 'IPS no encontrada' });
      }
      return res.json({ message: 'IPS eliminada correctamente', id });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = { IpsController };
