const { ProgramRepository } = require('../repositories/ProgramRepository');
const programRepo = new ProgramRepository();

class ProgramController {
  list = async (req, res, next) => {
    try {
      const onlyActive = req.query.onlyActive === 'true';
      const filter = onlyActive ? { active: true } : {};
      const list = await programRepo.find(filter, { sort: { name: 1 } });
      return res.json(list);
    } catch (error) {
      next(error);
    }
  };

  create = async (req, res, next) => {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ message: 'El nombre del programa es requerido' });
      }
      const existing = await programRepo.findOne({ name: name.trim() });
      if (existing) {
        return res.status(400).json({ message: 'El programa ya existe' });
      }
      const created = await programRepo.create({ name: name.trim() });
      return res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, active } = req.body;
      const updateData = {};
      if (name !== undefined) updateData.name = name.trim();
      if (active !== undefined) updateData.active = Boolean(active);

      const updated = await programRepo.update(id, updateData);
      if (!updated) {
        return res.status(404).json({ message: 'Programa no encontrado' });
      }
      return res.json(updated);
    } catch (error) {
      next(error);
    }
  };

  toggleStatus = async (req, res, next) => {
    try {
      const { id } = req.params;
      const program = await programRepo.findById(id);
      if (!program) {
        return res.status(404).json({ message: 'Programa no encontrado' });
      }
      program.active = !program.active;
      await program.save();
      return res.json(program);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req, res, next) => {
    try {
      const { id } = req.params;
      const deleted = await programRepo.delete(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Programa no encontrado' });
      }
      return res.json({ message: 'Programa eliminado correctamente', id });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = { ProgramController };
