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

  /**
   *
   * @returns
   *   "data": [
    {
      "primaryProductName": "Marketo Engage",
      "serp-content-type": "product"
    },
    {
      "primaryProductName": "Adobe Experience Platform",
      "serp-content-type": "service"
    },
    {
      "primaryProductName": "RTCDP",
      "serp-content-type": "b2b"
    },
    {
      "primaryProductName": "GenStudio",
      "serp-content-type": "b2c"
    },
    {
      "primaryProductName": "Experience Manager Sites",
      "serp-content-type": "caas"
    },
    {
      "primaryProductName": "Adobe Analytics",
      "serp-content-type": "adobe"
    },
    {
      "primaryProductName": "Adobe Firefly",
      "serp-content-type": "product"
    },
    {
      "primaryProductName": "Marketo",
      "serp-content-type": "marketing"
    },
    {
      "primaryProductName": "Adobe-Business",
      "serp-content-type": "AB"
    }
  ],
   */

  setSelectOptions() {
    if (!this._metadataOptions?.data?.length) return [];

    const firstItem = this._metadataOptions.data[0];
    const keys = Object.keys(firstItem);

    // Initialize the result structure
    const selectOptions = keys.map((key) => ({ keyName: key, values: [] }));

    // Single pass through the data to populate all values
    this._metadataOptions.data.forEach((item) => {
      keys.forEach((key) => {
        if (item[key]) {
          selectOptions.find((option) => option.keyName === key).values.push(item[key]);
        }
      });
    });

    return selectOptions;
  }

  async connectedCallback() {
    super.connectedCallback();
    this.shadowRoot.adoptedStyleSheets = [style];
    this._metadataOptions = await this.getMetadataOptions();
    this._selectOptions = this.setSelectOptions();
  }

  handleAdd(e) {
    e.preventDefault();
    const formData = new FormData(e.target.closest('form'));
    console.log(formData, e.target.closest('form'));
    const entries = Object.fromEntries(formData.entries());
    const empty = Object.keys(entries).some((key) => !entries[key]);

    if (empty) {
      // this._status = { type: 'error', message: 'Some fields empty.' };
      // return;
      console.log('empty');
    }

    console.log(entries);
    this._formFields = [...this._formFields, entries];
  }

  renderDefaultFields() {
    return this._defaultFields.map(({ key, value }) => html`
      <div class='fieldgroup'>
        <label for=${key}>${key}</label>
        <input type='text' name=${key} id=${key} placeholder=${value}></input>
      </div>
    `);
  }


  renderSelectField() {
    console.log(this._selectOptions, 'select options');
    return html`
      ${this._selectOptions.map((group) => {
        return html`
          <select name='${group.keyName}' id='${group.keyName}'>
            <option value="select-key">Select key</option>
            ${group.values.map((option) => html`<option value='${option}'>${option}</option>`)}
          </seclect>
        `
      })}
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
              <button><span class='copy-icon'></span>Copy as table</button>
            </div>
            ${this.renderDefaultFields()}
          </key
          <form class='add-fields'>
            ${this._selectOptions ? this.renderSelectField() : nothing}
            <button @click=${this.handleAdd}>Add</button>
          </form>
        </div>
      </section>
    </section>`;
  }
}

customElements.define('da-md-form', MdForm);
