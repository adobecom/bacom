import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';

const { default: init } = await import('../../../blocks/form/form.js');

function jsonOk(body) {
  const mockResponse = new window.Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-type': 'application/json' },
  });

  return Promise.resolve(mockResponse);
}

const MOCK_JSON = {
  total: 2,
  offset: 0,
  limit: 2,
  data: [
    {
      Field: 'email',
      Label: 'E-Mail',
      Placeholder: 'E.g. buzz@nasa.gov',
      Type: 'text-field',
      Format: 'email',
      Description: '',
      Mandatory: 'x',
      Extra: '',
      Error: '',
    },
    {
      Field: 'submit',
      Label: 'Start your trial',
      Placeholder: '',
      Type: 'submit',
      Format: '',
      Description: '',
      Mandatory: '',
      Extra: "Thank you for your interest in trials! We'll contact you soon!",
      Error: 'Please enter a valid company email address.',
    },
  ],
};

const MOCK_POST_JSON = { email: 'test@adobe.com' };

describe('Form Initialization', () => {
  let sandbox;
  before(async () => {
    document.body.innerHTML = await readFile({ path: './mocks/body.html' });
    sandbox = sinon.createSandbox();
    const stub = sandbox.stub(window, 'fetch');
    stub.onCall(0).returns(jsonOk(MOCK_JSON));
    stub.onCall(1).returns(jsonOk(MOCK_POST_JSON));
    const form = document.querySelector('.form');
    sinon.spy(window, 'addEventListener');
    await init(form);
  });

  it('Creates a submit button', () => {
    const button = document.querySelector('button');
    expect(button.classList.contains('con-button')).to.be.true;
  });

  it('Creates an input text field', () => {
    const inputField = document.querySelector('input');
    expect(inputField.getAttribute('type')).to.equal('text-field');
    expect(inputField.getAttribute('id')).to.equal('email');
    expect(inputField.getAttribute('placeholder')).to.equal('E.g. buzz@nasa.gov');
  });

  it('Error message shows up when input text field is left empty', () => {
    const button = document.querySelector('button');
    const event = new window.Event('click');
    button.dispatchEvent(event);
    const emailElement = document.getElementById('email');
    expect(emailElement.classList.contains('highlight')).to.be.true;
  });

  it('Error message shows up when input text field contains gmail address', () => {
    const emailElement = document.getElementById('email');
    emailElement.value = 'test@adobe.com';
    const button = document.querySelector('button');
    const event = new window.Event('click');
    button.dispatchEvent(event);
    expect(emailElement.classList.contains('highlight')).to.be.true;
  });

  it('Button is disabled when a company email address is entered', () => {
    const emailElement = document.getElementById('email');
    emailElement.value = 'test@adobe.com';
    const button = document.querySelector('button');
    const event = new window.Event('click');
    button.dispatchEvent(event);
    expect(button.getAttribute('disabled')).to.equal('');
  });

  afterEach(() => {
    sandbox.restore();
  });
});
