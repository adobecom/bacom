/* eslint-disable import/no-unresolved */
/* eslint-disable no-underscore-dangle */
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { constructTable } from '../../../tools/md-formatter/form.js';

const mockMetadataOptions = {
  data: [
    {
      Product: 'Photoshop',
      Platform: 'Desktop',
      Audience: 'Professional',
    },
    {
      Product: 'Illustrator',
      Platform: 'Desktop',
      Audience: 'Creative',
    },
    {
      Product: 'Premiere Pro',
      Platform: 'Desktop',
      Audience: 'Professional',
    },
  ],
};

const delay = (milliseconds) => new Promise((resolve) => { setTimeout(resolve, milliseconds); });

describe('MdForm', () => {
  let fetchStub;
  let originalSdk;

  beforeEach(async () => {
    document.body.innerHTML = '';

    // Mock fetch for getMetadataOptions
    fetchStub = sinon.stub(window, 'fetch');
    fetchStub.resolves({
      ok: true,
      json: async () => mockMetadataOptions,
    });

    // Store original DA_SDK if it exists
    originalSdk = window.DA_SDK;
  });

  afterEach(() => {
    fetchStub.restore();
    if (originalSdk) {
      window.DA_SDK = originalSdk;
    }
  });

  const init = async () => {
    const mdForm = document.createElement('da-md-form');
    document.body.append(mdForm);
    await delay(50); // Wait for connectedCallback and async operations
    return mdForm;
  };

  it('renders the metadata form', async () => {
    const mdForm = await init();

    expect(mdForm.shadowRoot.querySelector('.metadata-builder')).to.exist;
    expect(mdForm.shadowRoot.querySelector('h1').textContent).to.equal('Metadata Builder');

    const form = mdForm.shadowRoot.querySelector('form');
    expect(form).to.exist;
  });

  it('renders default title and description inputs', async () => {
    const mdForm = await init();

    const titleInput = mdForm.shadowRoot.querySelector('#title');
    expect(titleInput).to.exist;
    expect(titleInput.placeholder).to.equal('page title');

    const descInput = mdForm.shadowRoot.querySelector('#description');
    expect(descInput).to.exist;
    expect(descInput.placeholder).to.equal('page description');
  });

  it('fetches and sets metadata options on load', async () => {
    const mdForm = await init();

    expect(fetchStub.calledOnce).to.be.true;
    expect(mdForm._metadataOptions).to.deep.equal(mockMetadataOptions);
    expect(mdForm._availabileFieldKeys).to.have.lengthOf(3);
    expect(mdForm._availabileFieldKeys).to.include.members(['Product', 'Platform', 'Audience']);
  });

  it('populates select options correctly', async () => {
    const mdForm = await init();

    const propertySelect = mdForm.shadowRoot.querySelector('.select-property');
    expect(propertySelect).to.exist;

    const options = Array.from(propertySelect.querySelectorAll('option'));
    expect(options.length).to.be.at.least(3);

    const optionTexts = options.map((opt) => opt.textContent);
    expect(optionTexts).to.include('Product');
    expect(optionTexts).to.include('Platform');
    expect(optionTexts).to.include('Audience');
  });

  it('handles property selection', async () => {
    const mdForm = await init();

    const propertySelect = mdForm.shadowRoot.querySelector('.select-property');
    propertySelect.value = 'Product';
    propertySelect.dispatchEvent(new Event('change'));
    await delay(50);

    expect(mdForm._currentPropertySelect).to.equal('Product');
    expect(mdForm._currentValueList).to.have.lengthOf(3);
    expect(mdForm._currentValueList).to.include.members(['Photoshop', 'Illustrator', 'Premiere Pro']);
  });

  it('enables value select after property selection', async () => {
    const mdForm = await init();

    const valueSelect = mdForm.shadowRoot.querySelector('.select-value');
    expect(valueSelect.disabled).to.be.true;

    const propertySelect = mdForm.shadowRoot.querySelector('.select-property');
    propertySelect.value = 'Platform';
    propertySelect.dispatchEvent(new Event('change'));
    await delay(50);

    expect(valueSelect.disabled).to.be.false;
  });

  it('adds a field when add button is clicked', async () => {
    const mdForm = await init();

    // Select property
    const propertySelect = mdForm.shadowRoot.querySelector('.select-property');
    propertySelect.value = 'Product';
    propertySelect.dispatchEvent(new Event('change'));
    await delay(100);

    // Select value
    const valueSelect = mdForm.shadowRoot.querySelector('.key-value-select .select-value');
    valueSelect.value = 'Photoshop';
    await delay(50);

    // Click add button
    const addButton = mdForm.shadowRoot.querySelector('.key-value-select button');
    addButton.click();
    await delay(50);

    expect(mdForm._addedFields).to.have.lengthOf(1);
    expect(mdForm._addedFields[0].keyName).to.equal('Product');
    expect(mdForm._addedFields[0].selectedValue).to.equal('Photoshop');

    // Property should be removed from available keys
    expect(mdForm._availabileFieldKeys).to.not.include('Product');
  });

  it('renders added fields', async () => {
    const mdForm = await init();

    // Select and add a field
    const propertySelect = mdForm.shadowRoot.querySelector('.select-property');
    propertySelect.value = 'Platform';
    propertySelect.dispatchEvent(new Event('change'));
    await delay(50);

    const valueSelect = mdForm.shadowRoot.querySelector('.key-value-select .select-value');
    valueSelect.value = 'Desktop';

    const addButton = mdForm.shadowRoot.querySelector('.key-value-select button');
    addButton.click();
    await delay(50);

    // Check if field is rendered
    const label = mdForm.shadowRoot.querySelector('label[for="Platform"]');
    expect(label).to.exist;
    expect(label.textContent).to.equal('Platform');

    const fieldSelect = mdForm.shadowRoot.querySelector('select#Platform');
    expect(fieldSelect).to.exist;
    expect(fieldSelect.value).to.equal('Desktop');
  });

  it('removes a field when remove button is clicked', async () => {
    const mdForm = await init();

    // Add a field first
    const propertySelect = mdForm.shadowRoot.querySelector('.select-property');
    propertySelect.value = 'Audience';
    propertySelect.dispatchEvent(new Event('change'));
    await delay(50);

    const valueSelect = mdForm.shadowRoot.querySelector('.key-value-select .select-value');
    valueSelect.value = 'Professional';

    const addButton = mdForm.shadowRoot.querySelector('.key-value-select button');
    addButton.click();
    await delay(50);

    expect(mdForm._addedFields).to.have.lengthOf(1);

    // Now remove it
    const removeButton = mdForm.shadowRoot.querySelector('.remove');
    removeButton.click();
    await delay(50);

    expect(mdForm._addedFields).to.have.lengthOf(0);
    expect(mdForm._availabileFieldKeys).to.include('Audience');
  });

  it('disables property select when no fields are available', async () => {
    const mdForm = await init();

    // Add all available fields
    const fields = ['Product', 'Platform', 'Audience'];

    for (const field of fields) {
      const propertySelect = mdForm.shadowRoot.querySelector('.select-property');
      propertySelect.value = field;
      propertySelect.dispatchEvent(new Event('change'));
      await delay(50);

      const valueSelect = mdForm.shadowRoot.querySelector('.key-value-select .select-value');
      const options = Array.from(valueSelect.querySelectorAll('option'));
      if (options.length > 1) {
        valueSelect.value = options[1].value;
      }

      const addButton = mdForm.shadowRoot.querySelector('.key-value-select button');
      addButton.click();
      await delay(50);
    }

    const propertySelect = mdForm.shadowRoot.querySelector('.select-property');
    expect(propertySelect.disabled).to.be.true;
  });

  it('handles fetch error gracefully', async () => {
    fetchStub.restore();
    fetchStub = sinon.stub(window, 'fetch');
    fetchStub.resolves({
      ok: false,
      status: 404,
    });

    const mdForm = await init();

    expect(mdForm._optionsErrorMessage).to.equal('Failed to fetch metadata options');
    expect(mdForm._metadataOptions).to.deep.equal({});
  });

  it('resets current selection after adding field', async () => {
    const mdForm = await init();

    const propertySelect = mdForm.shadowRoot.querySelector('.select-property');
    propertySelect.value = 'Platform';
    propertySelect.dispatchEvent(new Event('change'));
    await delay(50);

    expect(mdForm._currentPropertySelect).to.equal('Platform');
    expect(mdForm._currentValueList.length).to.be.greaterThan(0);

    const valueSelect = mdForm.shadowRoot.querySelector('.key-value-select .select-value');
    valueSelect.value = 'Desktop';

    const addButton = mdForm.shadowRoot.querySelector('.key-value-select button');
    addButton.click();
    await delay(50);

    expect(mdForm._currentPropertySelect).to.equal('');
    expect(mdForm._currentValueList).to.have.lengthOf(0);
  });

  it('disables add button when no property is selected', async () => {
    const mdForm = await init();

    const addButton = mdForm.shadowRoot.querySelector('.key-value-select button');
    expect(addButton.disabled).to.be.true;

    const propertySelect = mdForm.shadowRoot.querySelector('.select-property');
    propertySelect.value = 'Product';
    propertySelect.dispatchEvent(new Event('change'));
    await delay(50);

    expect(addButton.disabled).to.be.false;
  });
});

describe('constructTable', () => {
  it('creates correct table structure with header and data rows', () => {
    const entries = {
      Title: 'Test Title',
      Description: 'Test Description',
      Product: 'Photoshop',
    };
    const table = constructTable(entries);

    expect(table.tagName).to.equal('TABLE');
    expect(table.querySelector('tbody')).to.exist;

    const firstRow = table.querySelector('tbody tr:first-child');
    const headerCell = firstRow.querySelector('td');
    expect(headerCell.getAttribute('colspan')).to.equal('2');
    expect(headerCell.querySelector('p').textContent).to.equal('metadata');

    const rows = table.querySelectorAll('tbody tr');
    expect(rows).to.have.lengthOf(4);

    const dataRows = Array.from(rows).slice(1);
    dataRows.forEach((row) => {
      const cells = row.querySelectorAll('td');
      expect(cells).to.have.lengthOf(2);
      expect(cells[0].querySelector('p')).to.exist;
      expect(cells[1].querySelector('p')).to.exist;
    });
  });

  it('lowercases keys but preserves original values', () => {
    const entries = {
      Title: 'Test Title With CAPS',
      Description: 'Description With CAPS',
    };
    const table = constructTable(entries);

    const dataRows = Array.from(table.querySelectorAll('tbody tr')).slice(1);

    const firstKeyCell = dataRows[0].querySelector('td:first-child p');
    const firstValueCell = dataRows[0].querySelector('td:nth-child(2) p');
    expect(firstKeyCell.textContent).to.equal('title');
    expect(firstValueCell.textContent).to.equal('Test Title With CAPS');

    const secondKeyCell = dataRows[1].querySelector('td:first-child p');
    const secondValueCell = dataRows[1].querySelector('td:nth-child(2) p');
    expect(secondKeyCell.textContent).to.equal('description');
    expect(secondValueCell.textContent).to.equal('Description With CAPS');
  });

  it('handles empty entries object', () => {
    const entries = {};
    const table = constructTable(entries);

    const rows = table.querySelectorAll('tbody tr');
    expect(rows).to.have.lengthOf(1); // Only header row
  });

  it('handles special characters in content', () => {
    const entries = {
      title: 'Test & Title <with> "quotes"',
      description: 'Description with \' apostrophe',
    };
    const table = constructTable(entries);

    const dataRows = Array.from(table.querySelectorAll('tbody tr')).slice(1);

    expect(dataRows[0].querySelector('td:nth-child(2) p').textContent).to.equal('Test & Title <with> "quotes"');
    expect(dataRows[1].querySelector('td:nth-child(2) p').textContent).to.equal('Description with \' apostrophe');
  });

  it('maintains order of entries', () => {
    const entries = {
      title: 'First',
      description: 'Second',
      product: 'Third',
    };
    const table = constructTable(entries);

    const dataRows = Array.from(table.querySelectorAll('tbody tr')).slice(1);
    const keys = dataRows.map((row) => row.querySelector('td:first-child p').textContent);

    expect(keys).to.deep.equal(['title', 'description', 'product']);
  });
});
