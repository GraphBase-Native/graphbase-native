import { generateCRUD } from './IO';
import { TreeToGraphQL } from 'graphql-js-tree';
import { TransformerDef } from 'transform-graphql';
import { generateModel } from './generateModel';

export const transformerCRUD: TransformerDef = {
    transformer: ({ field, operations }) => {
        if (!field.args) {
            throw new Error('Model can be used only for types');
        }
        if (!operations.query) {
            throw new Error('Query type required');
        }
        if (!operations.mutation) {
            throw new Error('Query type required');
        }
        const typedFields = TreeToGraphQL.parse({ nodes: field.args });
        generateModel(typedFields, field.name);
        generateCRUD(field.name);

        return `
        input Create${field.name}{
            ${typedFields}
        }
        input Update${field.name}{
            ${typedFields}
        }
        input Details${field.name}{
            id: String!
        }
        type ${field.name}Query{
            readAll: [${field.name}!]!
            readOne(details: Details${field.name}): ${field.name}
        }
        type ${field.name}Mutation{
            create( ${field.name[0].toLowerCase() + field.name.slice(1)}: Create${field.name} ): String!
            update( ${field.name[0].toLowerCase() + field.name.slice(1)}: Update${field.name}, details: Details${
            field.name
        } ): String!
            delete( details: Details${field.name} ): String!
        }
        extend type ${operations.query.name}{
            ${field.name[0].toLowerCase() + field.name.slice(1)}: ${field.name}Query
        }
        extend type ${operations.mutation.name}{
            ${field.name[0].toLowerCase() + field.name.slice(1)}: ${field.name}Mutation
        }
        `;
    },
    directiveName: 'model',
};