import { camelize } from './helpers';

export const formType = (name, values = []) => {
  console.log("-- name: ", name)
  console.log("-- values: ", values)


  if (values.length === 0)
    return `
        <p class="title">${name}</p>
        ${inputType(name, 'Saladas')}

        ${inputType(name, 'Prato Principal')}

        ${inputType(name, 'Guarnição')}

        ${inputType(name, 'Sobremesa')}

        ${inputType(name, 'Fruta')}
      `;

  let hasSaladas = values.find(elm => elm.tipoPrato === 'Saladas');
  let hasPratoPrincipal = values.find(elm => elm.tipoPrato === 'Prato Principal');
  let hasGuarnicao = values.find(elm => elm.tipoPrato === 'Guarnição');
  let hasSobremesa = values.find(elm => elm.tipoPrato === 'Sobremesa');
  let hasFrutas = values.find(elm => elm.tipoPrato === 'Frutas');

  let inputSaladas = '';
  let inputPratoPrincipal = '';
  let inputGuarnicao = '';
  let inputSobremesa = '';
  let inputFrutas = '';

  if (hasSaladas) {
    console.log("hasSaladas", hasSaladas)

    inputSaladas = inputType(name, 'Saladas', [...hasSaladas.Prato]);
  } else {
    inputSaladas = inputType(name, 'Saladas');
  }

  if (hasPratoPrincipal) {
    console.log("hasPratoPrincipal", hasPratoPrincipal)
    inputPratoPrincipal = inputType(name, 'Prato Principal', [...hasPratoPrincipal.Prato]);
  } else {
    inputPratoPrincipal = inputType(name, 'Prato Principal');
  }

  if (hasGuarnicao) {
    console.log("hasGuarnicao", hasGuarnicao)
    inputGuarnicao = inputType(name, 'Guarnição', [...hasGuarnicao.Prato]);
  } else {
    inputGuarnicao = inputType(name, 'Guarnição');
  }

  if (hasSobremesa) {
    console.log("hasSobremesa", hasSobremesa)
    inputSobremesa = inputType(name, 'Sobremesa', [...hasSobremesa.Prato]);
  } else {
    inputSobremesa = inputType(name, 'Sobremesa');
  }

  if (hasFrutas) {
    console.log("hasFrutas", hasFrutas)
    inputFrutas = inputType(name, 'Frutas', [...hasFrutas.Prato]);
  } else {
    inputFrutas = inputType(name, 'Frutas');
  }
  return `
    <p class="title">${name}</p>
    ${inputSaladas}

    ${inputPratoPrincipal}

    ${inputGuarnicao}

    ${inputSobremesa}

    ${inputFrutas}
  `;
};

export const inputType = (name, type, values = []) => {
  if (values.length === 0)
    return `
        <p class="input-title">${type}</p>
        <div class="input-container" data-type="${camelize(name)}-${camelize(type)}">
          <p class="input-help">Adicione a opção de fruta</p>
          <input type="text" placeholder="Insira a opção de salada" name="${camelize(name)}-${camelize(type)}[]"/>
        </div>
        <button class="add-option" data-type="${camelize(name)}-${camelize(type)}">
          <i class="ms-Icon ms-Icon--Add" aria-hidden="true"></i> Adicionar nova opção
        </button>
    `;

  let options = values.map(elm => {
    return `
      <div class="input-container" data-type="${camelize(name)}-${camelize(type)}">
        <p class="input-help">Adicione a opção de fruta</p>
        <input type="text" placeholder="Insira a opção de salada" name="${camelize(name)}-${camelize(type)}[]" value="${
      elm.nmAlimento
    }"/>
      </div>
    `;
  });

  return `
    <p class="input-title">${type}</p>
    ${options}
    <button class="add-option" data-type="${name.toLowerCase()}-${camelize(type)}">
      <i class="ms-Icon ms-Icon--Add" aria-hidden="true"></i> Adicionar nova opção
    </button>
  `;
};
