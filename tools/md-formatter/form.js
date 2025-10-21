/* eslint-disable arrow-body-style */
/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-unresolved */
import 'https://da.live/nx/public/sl/components.js';
import getStyle from 'https://da.live/nx/utils/styles.js';
import { LitElement, html, nothing } from 'da-lit';

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
    const selectedValue = this.renderRoot?.querySelector('.select-value');
    console.log(selectedValue, selectedValue.value);
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

  handlePropertySelect(e) {
    e.preventDefault();
    const selectedProperty = e.target.value;
    if (selectedProperty === 'Select property') return;
    this._currentPropertySelect = selectedProperty;
    const [list] = this._selectOptions.filter((option) => option.keyName === selectedProperty);
    this._currentValueList = list?.values;
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
        <button @click=${this.handleAdd}>Add</button>
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
              <button><span class='copy-icon'></span>Copy as table</button>
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
