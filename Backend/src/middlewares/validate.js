const { z } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    next(error);
  }
};

const syncSchema = z.object({
  records: z.array(
    z.object({
      id: z.string().uuid(),
      disease: z.string().min(1),
      confidence: z.number().min(0).max(1),
      riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']),
      imagePath: z.string().optional().nullable(),
      symptoms: z.any().optional(),
    })
  )
});

const vetSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  latitude: z.number(),
  longitude: z.number()
});

module.exports = {
  validate,
  syncSchema,
  vetSchema,
};
