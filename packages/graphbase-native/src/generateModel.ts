import { writeModelToFile } from './IO';
import { graphQLTypesToTS } from './graphQLTypesToTS';

type StructuredData = {
    [x: string]: string | StructuredData;
};

const newStrigify = (x: StructuredData): string => {
    return `{${Object.entries(x)
        .map(([key, val]) => `${key}:${typeof val === 'object' ? newStrigify(val) : val}`)
        .join(',\n')}}`;
};

export const generateModel = (typedFields: string, nameField: string) => {
    const arrayWithTypes = typedFields.split(/(\r\n|\n|\r)/gm).filter((i) => i !== '\n' && i !== '');
    const modelObject: Record<string, any> = {};
    arrayWithTypes.map((i) => {
        const fieldTuple = i.split(':');
        modelObject[fieldTuple[0]] = graphQLTypesToTS(fieldTuple[1]);
    });
    const modelDetailsObject: Record<string, any> = {};
    modelDetailsObject['_id'] = 'string';
    const model = `export type ${nameField}Model = ` + newStrigify(modelObject);
    const detailsModel = `export type ${nameField}ModelDetails = ` + newStrigify(modelDetailsObject);
    const modelWithId = `export type ${nameField}ModelWithId = ${nameField}ModelDetails & ${nameField}Model `;
    writeModelToFile(model);
    writeModelToFile(detailsModel);
    writeModelToFile(modelWithId);
};
