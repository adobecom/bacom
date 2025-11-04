/* eslint-disable arrow-body-style */
/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-unresolved */
import 'https://da.live/nx/public/sl/components.js';
import getStyle from 'https://da.live/nx/utils/styles.js';
import { LitElement, html, nothing } from 'da-lit';
import DA_SDK from 'https://da.live/nx/utils/sdk.js';

const close = html`
<svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 18 18" width="18">
  <defs>
    <style>
      .fill {
        fill: #464646;
      }
    </style>
  </defs>
  <title>S Close 18 N</title>
  <rect id="Canvas" fill="#ff13dc" opacity="0" width="18" height="18" /><path class="fill" d="M13.2425,3.343,9,7.586,4.7575,3.343a.5.5,0,0,0-.707,0L3.343,4.05a.5.5,0,0,0,0,.707L7.586,9,3.343,13.2425a.5.5,0,0,0,0,.707l.707.7075a.5.5,0,0,0,.707,0L9,10.414l4.2425,4.243a.5.5,0,0,0,.707,0l.7075-.707a.5.5,0,0,0,0-.707L10.414,9l4.243-4.2425a.5.5,0,0,0,0-.707L13.95,3.343a.5.5,0,0,0-.70711-.00039Z" />
</svg>`;
const add = html`
<svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 18 18" width="18">
  <defs>
    <style>
      .fill {
        fill: #464646;
      }
    </style>
  </defs>
  <title>S Add 18 N</title>
  <rect id="Canvas" fill="#ff13dc" opacity="0" width="18" height="18" /><path class="fill" d="M14.5,8H10V3.5A.5.5,0,0,0,9.5,3h-1a.5.5,0,0,0-.5.5V8H3.5a.5.5,0,0,0-.5.5v1a.5.5,0,0,0,.5.5H8v4.5a.5.5,0,0,0,.5.5h1a.5.5,0,0,0,.5-.5V10h4.5a.5.5,0,0,0,.5-.5v-1A.5.5,0,0,0,14.5,8Z" />
</svg>`;

const style = await getStyle(import.meta.url);

// For testing purposes, to remove later
// const mdConfig = 'https://main--da-bacom--adobecom.aem.live/drafts/slavin/metadata-selector/md-config.json';
// const pth = 'products'

class MdForm extends LitElement {
  static properties = {
    _title: { state: true },
    _formFields: { state: true },
    _addFields: { state: true },
    _optionsErrorMessage: { type: String },
    _metadataOptions: { state: true },
    _availabileFieldKeys: { type: Array },
    _selectOptions: { type: Array },
    _currentPropertySelect: { state: true },
    _currentValueList: { state: true },
    _addedFields: { type: Array },
  };

  constructor() {
    super();
    this._title = 'Metadata Builder';
    this._defaultFields = [
      { key: 'Title', value: 'page title' },
      { key: 'Description', value: 'page description' },
    ];
    this._addedFields = [];
    this._optionsErrorMessage = '';
    this._metadataOptions = {};
    this._availabileFieldKeys = [];
    this._selectOptions = [];
    this._currentPropertySelect = '';
    this._currentValueList = [];
    this._addedFields = [];
  }

  async getMetadataOptions() {
    const sheetUrl = 'https://main--da-bacom--adobecom.aem.live/drafts/slavin/nobu/allowed-ppn.json';
    const resp = await fetch(sheetUrl);
    if (!resp.ok) {
      this._optionsErrorMessage = 'Failed to fetch metadata options';
      return {};
    }
    const json = await resp.json();
    return json;
  }

  setSelectOptions() {
    if (!this._metadataOptions?.data?.length) return [];

    const firstItem = this._metadataOptions.data[0];
    const keys = Object.keys(firstItem);

    // Initialize the result structure
    const selectOptions = keys.map((key) => ({ keyName: key, values: [] }));
    const fieldKeys = [];

    // Single pass through the data to populate all values
    this._metadataOptions.data.forEach((item) => {
      keys.forEach((key) => {
        if (item[key]) {
          selectOptions.find((option) => option.keyName === key).values.push(item[key]);
        }
        if (!fieldKeys.includes(key)) {
          fieldKeys.push(key);
        }
      });
    });

    return [selectOptions, fieldKeys];
  }

  async connectedCallback() {
    super.connectedCallback();
    this.shadowRoot.adoptedStyleSheets = [style];
    this._metadataOptions = await this.getMetadataOptions();
    [this._selectOptions, this._availabileFieldKeys] = this.setSelectOptions();
    console.log('Set select options', this._selectOptions, this._availabileFieldKeys);
  }

  handleAdd(e) {
    e.preventDefault();
    const selectedValue = e.target.closest('.key-value-select').querySelector('.select-value');
    const fieldToAdd = {
      keyName: this._currentPropertySelect,
      values: this._currentValueList,
      selectedValue: selectedValue.value,
    };
    this._addedFields = [...this._addedFields, fieldToAdd];
    const addedPropIndex = this._availabileFieldKeys.indexOf(this._currentPropertySelect);
    const availableCopy = this._availabileFieldKeys.slice();
    availableCopy.splice(addedPropIndex, 1);
    this._availabileFieldKeys = availableCopy;
    this._currentPropertySelect = '';
    this._currentValueList = [];
  }

  handleRemove(e) {
    e.preventDefault();
    const key = e.target.closest('div').querySelector('label').innerText;
    const addedFieldsCopy = this._addedFields.slice();
    const removalIndex = addedFieldsCopy.findIndex((added) => added.keyName === key);
    addedFieldsCopy.splice(removalIndex, 1);
    this._addedFields = addedFieldsCopy;
    this._availabileFieldKeys = [...this._availabileFieldKeys, key];
    this._currentPropertySelect = '';
    this._currentValueList = [];
  }

  handlePropertySelect(e) {
    e.preventDefault();
    const selectedProperty = e.target.value;
    if (selectedProperty === 'Select property') return;
    this._currentPropertySelect = selectedProperty;
    const [list] = this._selectOptions.filter((option) => option.keyName === selectedProperty);
    this._currentValueList = list?.values;
  }

  async handleAddToDoc(e) {
    e.preventDefault();
    const { actions } = await DA_SDK.catch(() => null);

    const form = e.target.closest('form');
    const formData = new FormData(form);
    const entries = Object.fromEntries(formData.entries());

    const mdTable = `
      <table>
        <tbody>
          <tr>
            <td colspan="2">
              <p>metadata</p>
            </td>
          </tr>
        </tbody>
      </table>
    `;

    const tableObject = new DOMParser().parseFromString(mdTable, 'text/html');
    const table = tableObject.querySelector('table');
    const body = table.querySelector('tbody');

    Object.keys(entries).forEach((key) => {
      const tr = document.createElement('tr');

      const keyTd = document.createElement('td');
      const keyP = document.createElement('p');
      keyP.innerText = key.toLowerCase();
      keyTd.append(keyP);

      const valueTd = document.createElement('td');
      const valueP = document.createElement('p');
      valueP.innerText = entries[key];
      valueTd.append(valueP);

      tr.append(keyTd, valueTd);
      body.append(tr);
    });
    actions.sendHTML(table.outerHTML);
    actions.closeLibrary();
  }

  renderAddedFields() {
    return this._addedFields.map((fieldObj) => {
      const { keyName, values, selectedValue } = fieldObj;
      return html`
        <div>
          <label for='${keyName}'>${keyName}</label>
          <select class="select-value" name=${keyName} id=${keyName}>
            ${values.map((val) => html`<option ?selected=${selectedValue === val} value=${val}>${val}</option>`)}
          </select>
          <button @click=${this.handleRemove} class='remove'>${close}</button>
        </div>
      `;
    });
  }

  renderKeyValueSelect() {
    return html`
      <section class='key-value-select'>
        <select class="select-property" ?disabled=${this._availabileFieldKeys.length === 0} @change="${this.handlePropertySelect}"> 
          <option value="select-key" .value="" ?selected=${!this._currentPropertySelect}>Select property</option>
          ${this._availabileFieldKeys.map((property) => html`<option value=${property}>${property}</option>`)}
        </select>
        <select class="select-value" ?disabled=${!this._currentPropertySelect}>
          <option value="select-key" .value="">select value</option>
          ${this._currentValueList && this._currentValueList.map((value) => html`<option value=${value}>${value}</option>`)}
        </select>
        <button @click=${this.handleAdd}>${add}</button>
      </section>
    `;
  }

  render() {
    return html`
    <section class='metadata-builder'>
      <h1>${this._title}</h1>
      <section>
        <div class='builder-form'>
          <form>
            <div class='copy-as-table'>
              <!-- this is the submit button -->
              <h4>Metadata</h4>
              <button @click=${this.handleAddToDoc}><span class='copy-icon'></span>Add to doc</button>
            </div>
            <div>
              <label for='title'>title:</label>
              <input type='text' id='title' name='title' placeholder='page title'></input>
            </div>
            <div>
              <label for='description'>description:</label>
              <input type='text' id='description' name='description' placeholder='page description'></input>
            </div>
            ${this.renderAddedFields()}
            ${this.renderKeyValueSelect()}
        </div>
      </section>
    </section>`;
  }
}

customElements.define('da-md-form', MdForm);
