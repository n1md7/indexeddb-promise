import Joi from 'joi';

export const ConfigSchema = Joi.object({
  version: Joi.number()
    .positive()
    .label('Database version')
    .example(1)
    .required()
    .description(
      'The version to open the database with. If the version is not provided and the database exists, then a' +
        ' connection to the database will be opened without changing its version.',
    ),
  name: Joi.string().required().label('Database name').example('MyDatabase'),
  tables: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required().label('Table name').example('MyTable'),
        primaryKey: Joi.object({
          name: Joi.string().required().label('Primary key name').example('id'),
          autoIncrement: Joi.boolean()
            .required()
            .label('Auto increment')
            .example(true)
            .description('If true, the object store has a key generator.'),
          unique: Joi.boolean().required().label('Unique').example(true),
        }),
        indexes: Joi.object()
          .pattern(
            /./,
            Joi.object({
              unique: Joi.boolean()
                .required()
                .label('Unique')
                .example(true)
                .description('If true, the index will not allow duplicate values for a single key.'),
              multiEntry: Joi.boolean()
                .required()
                .label('Multi entry')
                .example(true)
                .description(
                  'If true, the index will add an entry in the index for each array element when the keyPath' +
                    ' resolves to an Array. If false, it will add one single entry containing the Array.',
                ),
            }),
          )
          .required()
          .example([{ name: 'index', unique: true, multiEntry: true }])
          .label('Indexes')
          .description('It creates a new field/column defining a new data point for each database record to contain.'),
        timestamps: Joi.boolean()
          .optional()
          .label('Timestamps')
          .example(true)
          .default(false)
          .description('If true, createdAt and updatedAt fields will be added automatically.'),
        initData: Joi.array()
          .items(Joi.object())
          .optional()
          .label('Initial data')
          .example([{ name: 'John', age: 30 }])
          .description(
            'If provided, the database will be initialized with the provided data. The data will be inserted' +
              ' in the database in the same order as the provided array.',
          ),
      }),
    )
    .required()
    .label('Tables'),
});
