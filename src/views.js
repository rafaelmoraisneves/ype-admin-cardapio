import { camelize } from './helpers';

export const formType = (name, values = []) => {
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
  let hasPratoPrincipal = values.find(elm => elm.tipoPrato === 'PratosPrincipais');
  let hasGuarnicao = values.find(elm => elm.tipoPrato === 'Guarnicoes');
  let hasSobremesa = values.find(elm => elm.tipoPrato === 'Sobremesas');
  let hasFrutas = values.find(elm => elm.tipoPrato === 'Frutas');

  let inputSaladas = '';
  let inputPratoPrincipal = '';
  let inputGuarnicao = '';
  let inputSobremesa = '';
  let inputFrutas = '';

  if (hasSaladas) {
    inputSaladas = inputType(name, 'Saladas', [...hasSaladas.Prato, ...hasSaladas.Opcao]);
  } else {
    inputSaladas = inputType(name, 'Saladas');
  }

  if (hasPratoPrincipal) {
    inputPratoPrincipal = inputType(name, 'Prato Principal', [...hasPratoPrincipal.Prato, ...hasPratoPrincipal.Opcao]);
  } else {
    inputPratoPrincipal = inputType(name, 'Prato Principal');
  }

  if (hasGuarnicao) {
    inputGuarnicao = inputType(name, 'Guarnição', [...hasGuarnicao.Prato, ...hasGuarnicao.Opcao]);
  } else {
    inputGuarnicao = inputType(name, 'Guarnição');
  }

  if (hasSobremesa) {
    inputSobremesa = inputType(name, 'Sobremesa', [...hasSobremesa.Prato, ...hasSobremesa.Opcao]);
  } else {
    inputSobremesa = inputType(name, 'Sobremesa');
  }

  if (hasFrutas) {
    inputFrutas = inputType(name, 'Frutas', [...hasFrutas.Prato, ...hasFrutas.Opcao]);
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
