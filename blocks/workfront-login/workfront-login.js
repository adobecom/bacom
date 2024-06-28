import { LIBS } from '../../scripts/scripts.js';

export async function createProofForm(createTag, replaceKey, config) {
  const form = createTag('form', { action: 'https://app.proofhq.com/login', method: 'post' });
  const emailLabel = createTag('label', { for: 'proof-email' }, await replaceKey('email', config));
  const emailInput = createTag('input', {
    type: 'email',
    id: 'proof-email',
    value: '',
    autocomplete: 'off',
    required: 'required',
  });
  const passLabel = createTag('label', { for: 'proof-password' }, await replaceKey('password', config));
  const passInput = createTag('input', {
    type: 'password',
    id: 'proof-password',
    value: '',
    required: 'required',
  });
  const submit = createTag('button', { type: 'submit', name: 'commit', value: 'Sign in', class: 'con-button' }, await replaceKey('sign-in', config));

  form.append(emailLabel, emailInput, passLabel, passInput, submit);

  return form;
}

/* c8 ignore next 1 */
export const location = { redirect: (url) => { window.location = url; } };

export async function createSubdomainForm(createTag, replaceKey, config) {
  const wrapper = createTag('div', { class: 'subdomain-form-wrapper' });
  const subdomainWrapper = createTag('div', { class: 'subdomain-wrapper' });
  const input = createTag('input', {
    type: 'text',
    class: 'subdomain-input',
    placeholder: await replaceKey('your-domain', config),
    'aria-label': await replaceKey('your-workfront-subdomain', config),
    'aria-required': 'true',
    'aria-invalid': 'false',
  });
  const text = createTag('div', { class: 'input-group-append' }, '.my.workfront.com');
  subdomainWrapper.append(input, text);

  const errorWrapper = createTag('div', { class: 'error-wrapper' });
  const alertIcon = '<svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 18 18" width="18"><path d="M8.5635,1.2895.2,16.256A.5.5,0,0,0,.636,17H17.364a.5.5,0,0,0,.436-.744L9.4365,1.2895a.5.5,0,0,0-.873,0ZM10,14.75a.25.25,0,0,1-.25.25H8.25A.25.25,0,0,1,8,14.75v-1.5A.25.25,0,0,1,8.25,13h1.5a.25.25,0,0,1,.25.25Zm0-3a.25.25,0,0,1-.25.25H8.25A.25.25,0,0,1,8,11.75v-6a.25.25,0,0,1,.25-.25h1.5a.25.25,0,0,1,.25.25Z" /></svg>';
  const error = createTag('p', { class: 'error-text', 'aria-live': 'polite', 'aria-atomic': 'true' });
  errorWrapper.insertAdjacentHTML('afterbegin', alertIcon);
  errorWrapper.append(error);

  const submitWrapper = createTag('div', {
    class: 'submit-wrapper',
    'data-component': 'button',
    'data-action': 'login',
    'data-name': 'submit-wrapper',
    'data-label': 'Sign in',
  });
  const button = createTag('button', { class: 'con-button', type: 'submit' }, await replaceKey('sign-in', config));
  const spinner = createTag('div', { class: 'spinner', style: 'display: none;' });

  const showError = (msg = 'You entered an incorrect subdomain. Please try again.') => {
    errorWrapper.querySelector('.error-text').textContent = msg;
    input.setAttribute('aria-invalid', 'true');
    input.classList.add('error');
    errorWrapper.classList.add('show');
    spinner.style.display = 'none';
    input.removeAttribute('disabled');
  };

  button.addEventListener('click', async (e) => {
    e.preventDefault();
    input.setAttribute('disabled', '');

    if (!input.value) {
      showError(await replaceKey('please-enter-your-subdomain', config));
      return;
    }

    const controller = new AbortController();
    setTimeout(() => controller.abort(), 4500);

    const checkURL = `https://${input.value}.my.workfront.com/`;
    spinner.style.display = 'block';

    try {
      const resp = await fetch(checkURL, { signal: controller.signal });
      if (resp.ok) {
        location.redirect(checkURL);
      } else {
        showError();
      }
    } catch (err) {
      if (!err.code) {
        location.redirect(checkURL);
      } else {
        showError();
      }
    }
  });

  submitWrapper.append(button, spinner);
  wrapper.append(subdomainWrapper, errorWrapper, submitWrapper);

  return wrapper;
}

/* c8 ignore next 14 */
export default async function init(el) {
  const { createTag, getConfig } = await import(`${LIBS}/utils/utils.js`);
  const { replaceKey } = await import(`${LIBS}/features/placeholders.js`);
  const config = getConfig();
  const isProof = el.classList.contains('proof');

  if (isProof) {
    const form = await createProofForm(createTag, replaceKey, config);
    el.append(form);
  } else {
    const subdomainForm = await createSubdomainForm(createTag, replaceKey, config);
    el.append(subdomainForm);
  }
}
