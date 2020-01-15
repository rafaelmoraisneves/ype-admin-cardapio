require('core-js');
require('@babel/polyfill');

require('./scss/style.scss');

console.log('admin_cardapio.js v0.0.3');

import $ from 'jquery';
import moment from 'moment';
import _ from 'lodash';

import { delay } from './helpers';
import { formType, inputType } from './views';

let sidePanelState = {
  onTransition: false
};

const initialCardapioState = {
  Unidade: '',
  DiaSemana: [
    {
      Dia: 'Segunda-Feira',
      tipoCozinha: []
    },
    {
      Dia: 'Terça-Feira',
      tipoCozinha: []
    },
    {
      Dia: 'Quarta-Feira',
      tipoCozinha: []
    },
    {
      Dia: 'Quinta-Feira',
      tipoCozinha: []
    },
    {
      Dia: 'Sexta-Feira',
      tipoCozinha: []
    },
    {
      Dia: 'Sábado',
      tipoCozinha: []
    }
  ]
};

const initalFormState = {
  caseira: {
    saladas: [],
    pratoPrincipal: [],
    guarnicao: [],
    sobremesa: [],
    frutas: []
  },
  receitaDoChef: {
    saladas: [],
    pratoPrincipal: [],
    guarnicao: [],
    sobremesa: [],
    frutas: []
  },
  bemEstar: {
    saladas: [],
    pratoPrincipal: [],
    guarnicao: [],
    sobremesa: [],
    frutas: []
  },
  vegetariano: {
    saladas: [],
    pratoPrincipal: [],
    guarnicao: [],
    sobremesa: [],
    frutas: []
  }
};

let cardapioState = {
  cardapioItems: [],
  addItemForm: _.cloneDeep(initalFormState),
  formBeingEdited: {
    unity: '',
    dayOfTheWeek: ''
  }
};

// const cardapioJson = require('./cardapio.json');

// function getCardapioData() {
//   return new Promise(function(resolve, reject) {
//     setTimeout(function() {
//       resolve(cardapioJson);
//     }, 10);
//   });
// }

function getCarpadio() {
  return new Promise(function(resolve, reject) {
    console.log('getCardapio');
    $.ajax({
      type: 'POST',
      url: '/Servicos/YPE.WebService.asmx/getCardapio',
      contentType: 'application/json; charset=ISO-8859-1',
      dataType: 'json',
      cache: false,
      async: true
    })
      .done(function(res) {
        console.log('getCardapio success:', res.d);
        resolve(JSON.parse(res.d));
      })
      .catch(function(err) {
        reject(err);
      });
  });
}

$(function() {
  getCarpadio();
  if (moment().weekday() === 0) {
    $('.start-date').text(
      moment()
        .day(1 + 7)
        .format('DD/MM')
    );
    $('.end-date').text(
      moment()
        .day(6 + 7)
        .format('DD/MM')
    );
  } else {
    $('.start-date').text(
      moment()
        .day(1)
        .format('DD/MM')
    );
    $('.end-date').text(
      moment()
        .day(6)
        .format('DD/MM')
    );
  }

  // getCardapioData().then(function(data) {
  //   cardapioState.cardapioItems = data.Unidades.map((elm, index) => {
  //     let newUnity = _.cloneDeep(initialCardapioState);
  //     newUnity.Unidade = elm.Unidade;
  //     newUnity.open = false;
  //     return newUnity;
  //   });

  //   data.Cardapio.map(elm => {
  //     let unityIndex = cardapioState.cardapioItems.findIndex(insideElm => insideElm.Unidade === elm.Unidade);

  //     elm.DiaSemana.map(anotherElm => {
  //       let dayOfTheWeekIndex = cardapioState.cardapioItems[unityIndex].DiaSemana.findIndex(
  //         elm => elm.Dia === anotherElm.Dia
  //       );

  //       cardapioState.cardapioItems[unityIndex].DiaSemana[dayOfTheWeekIndex].tipoCozinha = anotherElm.tipoCozinha;
  //     });
  //   });

  //   cardapioState.cardapioItems[0].open = true;

  //   console.log(cardapioState);

  //   $('.cardapio__list').html(cardapioAllItems(cardapioState.cardapioItems));
  //   attachClickEvents();
  // });

  getCarpadio().then(function(data) {
    cardapioState.cardapioItems = data.Unidades.map((elm, index) => {
      let newUnity = _.cloneDeep(initialCardapioState);
      newUnity.Unidade = elm.unidade;
      newUnity.open = false;
      return newUnity;
    });

    data.Cardapio.map(elm => {
      let unityIndex = cardapioState.cardapioItems.findIndex(insideElm => insideElm.unidade === elm.unidade);

      elm.DiaSemana.map(anotherElm => {
        let dayOfTheWeekIndex = cardapioState.cardapioItems[unityIndex].DiaSemana.findIndex(
          elm => {
            return elm.Dia === anotherElm.Dia
          }
        );
        cardapioState.cardapioItems[unityIndex].DiaSemana[dayOfTheWeekIndex].tipoCozinha = anotherElm.tipoCozinha;
      });
    });

    cardapioState.cardapioItems[0].open = true;

    console.log(cardapioState);

    $('.cardapio__list').html(cardapioAllItems(cardapioState.cardapioItems));
    attachClickEvents();
  });
});

function toggleAccordion(event) {
  event.preventDefault();

  let unity = $(this)
    .closest('.cardapio__item')
    .data('unity');

  let unityIndex = cardapioState.cardapioItems.findIndex(elm => elm.Unidade === unity);

  let hasClass = $(this)
    .parent()
    .hasClass('show');

  $('.cardapio__item').removeClass('show');

  cardapioState.cardapioItems.map(elm => {
    elm.open = false;
    return elm;
  });

  if (hasClass) {
    $(this)
      .parent()
      .removeClass('show');
  } else {
    cardapioState.cardapioItems[unityIndex].open = true;
    $(this)
      .parent()
      .addClass('show');
  }
}

function attachClickEvents() {
  $('.cardapio__item .item__name').on('click', toggleAccordion);

  $('.cardapio__item .action-view').on('click', detailsView);

  $('.cardapio__item .action-edit').on('click', editFormView);

  $('.cardapio__item .item-actions__add-item').on('click', createFormView);

  $('.cardapio__item .action-delete').on('click', deleteCarpapioDayOfTheWeek);
}

function cardapioAllItems(items) {
  let allItems = [];
  for (let i = 0; i < items.length; i++) {
    allItems.push(cardapioItem(items[i]));
  }
  return allItems.join('');
}

function cardapioItem(item) {
  let daysOfTheWeek = cardapioDayOfTheWeekItems(item.DiaSemana);

  let showClass = '';

  if (item.open) {
    showClass = ' show';
  }

  return `
  <div class="cardapio__item${showClass}" data-unity="${item.Unidade}">
    <div class="item__name">
      ${item.Unidade}
      <i class="ms-Icon ms-Icon--CaretDownSolid8 caret-icon" aria-hidden="true"></i>
    </div>
    <div class="item__days">
      <div class="item__days-container">
      ${daysOfTheWeek}
      </div>
    </div>
  </div>
  `;
}

function cardapioDayOfTheWeekItems(items) {
  let dayOfTheWeekItems = [];
  for (let i = 0; i < items.length; i++) {
    dayOfTheWeekItems.push(cardapioDayOfTheWeek(items[i]));
  }
  return dayOfTheWeekItems.join('');
}

function cardapioDayOfTheWeek(item) {
  let actionType = item.tipoCozinha.length > 0 ? 'edit' : 'add';
  let itemAction = getItemAction(actionType);
  return `
  <div class="cardapio__day_of_the_week" data-day-of-the-week="${item.Dia}">
    <div class="cardapio__box">
      <div class="item-actions">
        ${itemAction}
      </div>
      <div class="item__day-name">${item.Dia}</div>
    </div>
  </div>
  `;
}

function getItemAction(type) {
  switch (type) {
    case 'add':
      return `
        <div class="item-actions__add-item">
          <i class="ms-Icon ms-Icon--Add add-icon" aria-hidden="true"></i>
        </div>
      `;
    case 'edit':
      return `
        <div class="item-actions__edit-item">
          <div class="edit-icon__container">
            <i class="ms-Icon ms-Icon--ReceiptCheck check-icon" aria-hidden="true"></i>
          </div>
          <div class="actions__container">
            <div class="action action-view">
              <i class="ms-Icon ms-Icon--View" aria-hidden="true"></i>
            </div>
            <div class="action action-edit">
              <i class="ms-Icon ms-Icon--Edit" aria-hidden="true"></i>
            </div>
            <div class="action action-delete">
              <i class="ms-Icon ms-Icon--Delete" aria-hidden="true"></i>
            </div>
          </div>
        </div>
      `;
    default:
      return ``;
  }
}

async function openSidePanel(content) {
  if (sidePanelState.onTransition) {
    return;
  }

  let sidePanel = `
    <div class="side-panel">
      <div class="side-panel__overlay"></div>
      <div class="side-panel__content">
        ${content}
      </div>
    </div>
  `;

  $('body').addClass('ovf-hidden');

  let isSidePanelOpen = document.querySelector('.side-panel');

  if (isSidePanelOpen) {
    changeSidePanel(content);
    return;
  }

  sidePanelState.onTransition = true;

  $('body').append(sidePanel);

  $('.side-panel').addClass('show');

  await delay(100);

  $('.side-panel .side-panel__overlay').addClass('reveal');
  $('.side-panel .side-panel__content').addClass('open');

  $('.side-panel .side-panel__overlay').on('click', closeSidePanel);

  $('.side-panel .side-panel__content .btn-change-side-panel').on('click', editFormView);
  $('.side-panel .side-panel__content .btn-close-side-panel').on('click', closeSidePanel);

  await delay(300);

  sidePanelState.onTransition = false;
}

async function closeSidePanel(event = null) {
  if (sidePanelState.onTransition) {
    return;
  }

  sidePanelState.onTransition = true;

  $('.side-panel .side-panel__overlay').removeClass('reveal');
  $('.side-panel .side-panel__content').removeClass('open');

  await delay(400);

  $('.side-panel').remove();

  $('body').removeClass('ovf-hidden');

  sidePanelState.onTransition = false;
}

async function changeSidePanel(content) {
  if (sidePanelState.onTransition) {
    return;
  }

  sidePanelState.onTransition = true;

  $('.side-panel .side-panel__content').removeClass('open');

  let newSidePanelContent = `
    <div class="side-panel__content">
      ${content}
    </div>
  `;

  $('.side-panel').append(newSidePanelContent);

  await delay(100);

  let allSidePanels = document.querySelectorAll('.side-panel .side-panel__content');

  $(allSidePanels[1]).addClass('open');

  await delay(300);

  $(allSidePanels[0]).remove();

  $('.side-panel .side-panel__content .btn-change-side-panel').on('click', editFormView);
  $('.side-panel .side-panel__content .btn-close-side-panel').on('click', closeSidePanel);

  sidePanelState.onTransition = false;
}

async function editFormView(event) {
  let unity;
  let dayOfTheWeek;
  if ($(this).hasClass('btn-change-side-panel')) {
    dayOfTheWeek = $(this).data('day-of-the-week');
    unity = $(this).data('unity');
  } else {
    dayOfTheWeek = $(this)
      .closest('.cardapio__day_of_the_week')
      .data('day-of-the-week');
    unity = $(this)
      .closest('.cardapio__item')
      .data('unity');
  }

  let unityItem = cardapioState.cardapioItems.find(elm => elm.Unidade === unity);

  let dayOfTheWeekItem = unityItem.DiaSemana.find(elm => elm.Dia === dayOfTheWeek);

  cardapioState.addCardapioStep = 1;

  cardapioState.formBeingEdited.unity = unityItem.Unidade;
  cardapioState.formBeingEdited.dayOfTheWeek = dayOfTheWeekItem.Dia;

  let hasCaseira = dayOfTheWeekItem.tipoCozinha.find(elm => elm.tipoCozinha === 'Caseira');
  let formCaseira = '';

  if (hasCaseira) {
    formCaseira = formType('Caseira', hasCaseira.Prato);
  } else {
    formCaseira = formType('Caseira');
  }

  let hasReceitaDoChef = dayOfTheWeekItem.tipoCozinha.find(elm => elm.tipoCozinha === 'Receita do Chef');
  let formReceitaDoChef = '';

  if (hasReceitaDoChef) {
    formReceitaDoChef = formType('Receita do Chef', hasReceitaDoChef.Prato);
  } else {
    formReceitaDoChef = formType('Receita do Chef');
  }

  let hasBemEstar = dayOfTheWeekItem.tipoCozinha.find(elm => elm.tipoCozinha === 'Bem-estar');
  let formBemEstar = '';

  if (hasBemEstar) {
    formBemEstar = formType('Bem-estar', hasBemEstar.Prato);
  } else {
    formBemEstar = formType('Bem-estar');
  }

  let hasVegetariano = dayOfTheWeekItem.tipoCozinha.find(elm => elm.tipoCozinha === 'Vegetariano');
  let formVegetariano = '';

  if (hasVegetariano) {
    formVegetariano = formType('Vegetariano', hasVegetariano.Prato);
  } else {
    formVegetariano = formType('Vegetariano');
  }

  let html = `
    <div class="create-form-view">
      <div class="create-form-view__header">
        <h3 class="title">Editar Cardápio <span>${cardapioState.addCardapioStep} de 4</span></h3>
        <h4 class="subtitle">${unityItem.Unidade} | ${dayOfTheWeekItem.Dia}</h4>
      </div>
      <div class="create-form-view__content">
        <div class="step step-1 show">
          ${formCaseira}
        </div>
        <div class="step step-2">
          ${formReceitaDoChef}
        </div>
        <div class="step step-3">
          ${formBemEstar}
        </div>
        <div class="step step-4">
          ${formVegetariano}
        </div>
      </div>
      <div class="create-form-view__bottom">
        <button class="btn-next" data-unity="${unityItem.Unidade}" data-day-of-the-week="${dayOfTheWeekItem.Dia}">Próximo</button>
        <button class="btn-cancel btn-close-side-panel">Cancelar</button>
      </div>
    </div>
  `;

  await openSidePanel(html);

  $('.add-option').on('click', function(event) {
    let type = $(this).data('type');

    $(`.input-container[data-type="${type}"]`).last().after(`
      <div class="input-container" data-type="${type}">
        <p class="input-help">Adicione a opção de salada</p>
        <input type="text" placeholder="Insira a opção de salada" name="caseiro-salada[]"/>
        <div class="remove-input" data-type="${type}"><i class="ms-Icon ms-Icon--ChromeClose" aria-hidden="true"></i></div>
      </div>`);

    $('.create-form-view__content input').on('change keyup paste', updateAddFormState);

    $('.create-form-view__content .input-container .remove-input').on('click', removeInput);
  });

  $('.create-form-view__content input').on('change keyup paste', updateAddFormState);

  $('.create-form-view__bottom .btn-next').on('click', nextOrSubmitAddForm);

  updateAllFormState();
}

async function createFormView(event) {
  let dayOfTheWeek = $(this)
    .closest('.cardapio__day_of_the_week')
    .data('day-of-the-week');
  let unity = $(this)
    .closest('.cardapio__item')
    .data('unity');

  cardapioState.addItemForm = _.cloneDeep(initalFormState);

  cardapioState.addCardapioStep = 1;

  let unityItem = cardapioState.cardapioItems.find(elm => elm.Unidade === unity);

  let dayOfTheWeekItem = unityItem.DiaSemana.find(elm => elm.Dia === dayOfTheWeek);

  cardapioState.formBeingEdited.unity = unityItem.Unidade;
  cardapioState.formBeingEdited.dayOfTheWeek = dayOfTheWeekItem.Dia;

  let html = `
    <div class="create-form-view">
      <div class="create-form-view__header">
        <h3 class="title">Adicionar Cardápio <span>${cardapioState.addCardapioStep} de 4</span></h3>
        <h4 class="subtitle">${unityItem.Unidade} | ${dayOfTheWeekItem.Dia}</h4>
      </div>
      <div class="create-form-view__content">
        <div class="step step-1 show">
          ${formType('Caseira')}
        </div>
        <div class="step step-2">
          ${formType('Receita do Chef')}
        </div>
        <div class="step step-3">
          ${formType('Bem-estar')}
        </div>
        <div class="step step-4">
          ${formType('Vegetariano')}
        </div>
      </div>
      <div class="create-form-view__bottom">
        <button class="btn-next">Próximo</button>
        <button class="btn-cancel btn-close-side-panel">Cancelar</button>
      </div>
    </div>
  `;
  await openSidePanel(html);

  $('.add-option').on('click', function(event) {
    let type = $(this).data('type');

    $(`.input-container[data-type="${type}"]`).last().after(`
      <div class="input-container" data-type="${type}">
        <p class="input-help">Adicione a opção de salada</p>
        <input type="text" placeholder="Insira a opção de salada" name="${type}[]"/>
        <div class="remove-input" data-type="${type}"><i class="ms-Icon ms-Icon--ChromeClose" aria-hidden="true"></i></div>
      </div>`);

    $('.create-form-view__content input').on('change keyup paste', updateAddFormState);

    $('.create-form-view__content .input-container .remove-input').on('click', removeInput);
  });

  $('.create-form-view__content input').on('change keyup paste', updateAddFormState);

  $('.create-form-view__bottom .btn-next').on('click', nextOrSubmitAddForm);
}

function removeInput(event) {
  let types = $(this)
    .data('type')
    .split('-');

  let type = types[0];
  let subtype = types[1];

  $(this)
    .parent()
    .remove();

  updateByTypeAndSubtype(type, subtype);
}

function nextOrSubmitAddForm(event) {
  if (cardapioState.addCardapioStep === 4) {
    submitAddForm();
  } else {
    nextAddForm();
  }
}

async function nextAddForm() {
  cardapioState.addCardapioStep++;
  $('.create-form-view__content .step').removeClass('show');
  $(`.create-form-view__content .step-${cardapioState.addCardapioStep}`).addClass('show');
  $('.create-form-view__header .title span').text(`${cardapioState.addCardapioStep} de 4`);

  await delay(50);

  document.querySelector('.create-form-view__content').scrollTop = 0;

  if (cardapioState.addCardapioStep === 4) $('.create-form-view__bottom .btn-next').text('Publicar');
}

function submitAddForm() {
  let canSubmit = false;
  for (let item in cardapioState.addItemForm) {
    for (let insideItem in cardapioState.addItemForm[item]) {
      if (cardapioState.addItemForm[item][insideItem].length > 0) {
        canSubmit = true;
      }
    }
  }

  formStateToPageState();

  $('.cardapio__list').html(cardapioAllItems(cardapioState.cardapioItems));

  attachClickEvents();

  closeSidePanel();

  submitPostCardapio();
}

function updateAddFormState(event) {
  let types = this.name.replace('[]', '').split('-');
  let type = types[0];
  let subtype = types[1];

  updateByTypeAndSubtype(type, subtype);
}

function updateAllFormState() {
  let types = ['caseira', 'receitaDoChef', 'bemEstar', 'vegetariano'];

  let subtypes = ['saladas', 'pratoPrincipal', 'guarnicao', 'sobremesa', 'frutas'];

  for (let type of types) {
    for (let subtype of subtypes) {
      updateByTypeAndSubtype(type, subtype);
    }
  }
}

function updateByTypeAndSubtype(type, subtype) {
  cardapioState.addItemForm[type][subtype] = [];
  $(`.create-form-view__content input[name="${type}-${subtype}[]"]`).each((index, elm) => {
    if (elm.value) cardapioState.addItemForm[type][subtype].push(elm.value);
  });
}

async function detailsView(event) {
  let dayOfTheWeek = $(this)
    .closest('.cardapio__day_of_the_week')
    .data('day-of-the-week');
  let unity = $(this)
    .closest('.cardapio__item')
    .data('unity');

  let unityItem = cardapioState.cardapioItems.find(elm => elm.Unidade === unity);

  let dayOfTheWeekItem = unityItem.DiaSemana.find(elm => elm.Dia === dayOfTheWeek);

  let tipoCozinha = dayOfTheWeekItem.tipoCozinha
    .map((elm, index) => {
      let selected = '';
      if (index === 0) {
        selected = ' selected';
      }
      return `
        <div class="d-table-cell tipo-cozinha-title${selected}" data-tipo-cozinha="${elm.tipoCozinha}"><span>${elm.tipoCozinha}<span></div>
      `;
    })
    .join('');

  let tipoCozinhaDetails = dayOfTheWeekItem.tipoCozinha
    .map((elm, index) => {
      let show = '';

      if (index === 0) {
        show = ' show';
      }

      if(elm.Prato && elm.Prato.length > 0){
        let pratos = elm.Prato.map(elm => {

          if(!elm.Opcao) return

          if(!elm.Prato) return
         
          let opcaoInside = elm.Opcao.map(elm => {
            return `<p class="prato">${elm.nmAlimento}</p>`;
          }).join('');

  
          let pratosInside = elm.Prato.map(elm => {
            return `<p class="prato">${elm.nmAlimento}</p>`;
          }).join('');
  
          return `<div class="pratos-item">
              <p class="tipo-title">${elm.tipoPrato}</p>${pratosInside}${opcaoInside}
            </div>
          `;
        }).join('');
        return `<div class="tipo-cozinha${show}" data-tipo-cozinha="${elm.tipoCozinha}">${pratos}</div>`;
      }
      
    })
    .join('');

  let html = `
    <div class="details-view__header">
      <button class="btn-change-side-panel" data-unity="${unityItem.Unidade}" data-day-of-the-week="${dayOfTheWeekItem.Dia}"><i class="ms-Icon ms-Icon--Edit" aria-hidden="true"></i> Editar</button>
      <button class="btn-close-side-panel"><i class="ms-Icon ms-Icon--ChromeClose" aria-hidden="true"></i> Fechar</button>
    </div>
    <div class="details-view__content">
      <h3 class="title">Detalhes</h3>
      <h4 class="subtitle">${unityItem.Unidade} | ${dayOfTheWeekItem.Dia}</h4>
      <div class="d-table table-fixed tipo-cozinha-header">
        ${tipoCozinha}
      </div>
      <div class="pratos-list">
        ${tipoCozinhaDetails}
      </div>
    </div>
  `;
  await openSidePanel(html);

  $('.tipo-cozinha-title').on('click', openTab);
}

function deleteCarpapioDayOfTheWeek(event) {
  let dayOfTheWeek = $(this)
    .closest('.cardapio__day_of_the_week')
    .data('day-of-the-week');
  let unity = $(this)
    .closest('.cardapio__item')
    .data('unity');

  let unityIndex = cardapioState.cardapioItems.findIndex(elm => elm.Unidade === unity);

  let dayOfTheWeekIndex = cardapioState.cardapioItems[unityIndex].DiaSemana.findIndex(elm => elm.Dia === dayOfTheWeek);

  cardapioState.cardapioItems[unityIndex].DiaSemana[dayOfTheWeekIndex].tipoCozinha = [];

  $('.cardapio__list').html(cardapioAllItems(cardapioState.cardapioItems));

  attachClickEvents();

  submitPostCardapio();
}

function openTab(event) {
  let tipoCozinha = $(this).data('tipo-cozinha');

  $(this)
    .parent()
    .find(`[data-tipo-cozinha]`)
    .removeClass('selected');

  $(this).addClass('selected');

  $(this)
    .parent()
    .parent()
    .find('.pratos-list')
    .find(`[data-tipo-cozinha]`)
    .removeClass('show');

  $(this)
    .parent()
    .parent()
    .find('.pratos-list')
    .find(`[data-tipo-cozinha="${tipoCozinha}"]`)
    .addClass('show');
}

function formStateToPageState() {
  let formState = cardapioState.addItemForm;
  let unity = cardapioState.formBeingEdited.unity;
  let dayOfTheWeek = cardapioState.formBeingEdited.dayOfTheWeek;

  let unityIndex = cardapioState.cardapioItems.findIndex(elm => elm.Unidade === unity);

  let dayOfTheWeekIndex = cardapioState.cardapioItems[unityIndex].DiaSemana.findIndex(elm => elm.Dia === dayOfTheWeek);

  let newDiaSemana = {
    Dia: dayOfTheWeek,
    tipoCozinha: []
  };

  for (let index in formState) {
    let newTipoCozinha = {
      tipoCozinha: '',
      Prato: []
    };
    switch (index) {
      case 'caseira':
        newTipoCozinha.tipoCozinha = 'Caseira';
        break;
      case 'receitaDoChef':
        newTipoCozinha.tipoCozinha = 'Receita do Chef';
        break;
      case 'bemEstar':
        newTipoCozinha.tipoCozinha = 'Bem-estar';
        break;
      case 'vegetariano':
        newTipoCozinha.tipoCozinha = 'Vegetariano';
        break;
    }
    for (let subIndex in formState[index]) {
      if (formState[index][subIndex].length > 0) {
        switch (subIndex) {
          case 'saladas':
            newTipoCozinha.Prato.push({
              tipoPrato: 'Saladas',
              Prato: [],
              Opcao: formState[index][subIndex].map(elm => {
                return { nmAlimento: elm };
              })
            });
            break;
          case 'pratoPrincipal':
            newTipoCozinha.Prato.push({
              tipoPrato: 'Prato Principal',
              Prato: [],
              Opcao: formState[index][subIndex].map(elm => {
                return { nmAlimento: elm };
              })
            });
            break;
          case 'guarnicao':
            newTipoCozinha.Prato.push({
              tipoPrato: 'Guarnição',
              Prato: [],
              Opcao: formState[index][subIndex].map(elm => {
                return { nmAlimento: elm };
              })
            });
            break;
          case 'sobremesa':
            newTipoCozinha.Prato.push({
              tipoPrato: 'Sobremesa',
              Prato: [],
              Opcao: formState[index][subIndex].map(elm => {
                return { nmAlimento: elm };
              })
            });
            break;
          case 'frutas':
            newTipoCozinha.Prato.push({
              tipoPrato: 'Frutas',
              Prato: [],
              Opcao: formState[index][subIndex].map(elm => {
                return { nmAlimento: elm };
              })
            });
            break;
        }
      }
    }

    if (newTipoCozinha.Prato.length > 0) {
      newDiaSemana.tipoCozinha.push(newTipoCozinha);
    }
  }
  cardapioState.cardapioItems[unityIndex].DiaSemana[dayOfTheWeekIndex] = newDiaSemana;
}

function submitPostCardapio() {
  let data = {
    cardapio: []
  };
  cardapioState.cardapioItems.map(unity => {
    unity.DiaSemana.map(diaSemana => {
      diaSemana.tipoCozinha.map(tipoCozinha => {
        tipoCozinha.Prato.map(prato => {
          console.log("_________ prato: ", prato)
          let pratos = prato.Prato;
          pratos.map(alimento => {
            data.cardapio.push({
              Unidade: unity.Unidade,
              tipoCozinha: tipoCozinha.tipoCozinha,
              DiaSemana: diaSemana.Dia,
              tipoPrato: prato.tipoPrato,
              nmAlimento: alimento.nmAlimento
            });
          });
        });
      });
    });
  });


  $.ajax({
    type: 'POST',
    url: '/Servicos/YPE.WebService.asmx/postCardapio',
    contentType: 'application/json; charset=ISO-8859-1',
    dataType: 'json',
    data: JSON.stringify(data),
    cache: false,
    async: true
  })
    .done(function(res) {
      console.log('postCardapio success:', res.d);
    })
    .catch(function(err) {
      console.log('postCardapio error:', err);
    });
}
