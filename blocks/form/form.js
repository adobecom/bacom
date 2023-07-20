function constructPayload(form) {
  const payload = {};
  [...form.elements].forEach((fe) => {
    if (fe.id) {
      payload[fe.id] = fe.value;
    }
  });
  return payload;
}

/**
 * Once the payload is constructed and the form entry is validated,
 * we submit the form. It creates an entry in the spreadsheet to store the form
 * data.
 */
async function submitForm(form) {
  const payload = constructPayload(form);

  const resp = await fetch(form.dataset.action, {
    method: 'POST',
    cache: 'no-cache',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: payload }),
  });
  await resp.text();
  return payload;
}

/**
 * We check the validity of the email entry. We only accept company email addresses
 * as of now.
 */
function checkValidity(form) {
  const payload = constructPayload(form);
  const { email } = payload;
  const regex = /^[^@]+@(?!(yahoo|hotmail|gmail|icloud|outlook))[^@]+\.[a-z]{2,}$/;
  return String(email).match(regex);
}

/**
 * We create a submit button for the form.
 * Once we click on submit, if the email entry is valid, we disable
 * the submit button and redirect the user to the thank you page.
 */
function createButton(field) {
  const button = document.createElement('button');
  button.textContent = field.Label;
  button.classList.add('button');
  button.classList.add('primary');
  if (field.Type === 'submit') {
    button.addEventListener('click', async (event) => {
      const form = button.closest('form');
      event.preventDefault();
      if (checkValidity(form) !== null) {
        button.setAttribute('disabled', '');
        await submitForm(form);
        form.classList.add('hide');
        const section = form.closest('.section');
        section.firstElementChild.classList.add('hide');
        const formParent = form.closest('div');
        const paragraph = document.createElement('p');
        paragraph.classList.add('trial-sign-up-message');
        const text = document.createTextNode(field.Extra);
        paragraph.appendChild(text);
        formParent.appendChild(paragraph);
      } else {
        const emailElement = document.getElementById('email');
        if (emailElement.closest('div').childNodes.length < 2) {
          const paragraph = document.createElement('p');
          const text = document.createTextNode(field.Error);
          paragraph.appendChild(text);
          emailElement.classList.add('highlight');
          emailElement.closest('div').appendChild(paragraph);
        }
      }
    });
  }
  return button;
}

/**
 * We create an input field and pick up the type, id, and placeholder text
 * from the helix-default spreadsheet on sharepoint.
 */
function createInput(field) {
  const input = document.createElement('input');
  input.type = field.Type;
  input.id = field.Field;
  input.setAttribute('placeholder', field.Placeholder);
  if (field.Mandatory === 'x') {
    input.setAttribute('required', 'required');
  }
  return input;
}

function fill(form) {
  const { action } = form.dataset;
  if (action === '/tools/bot/register-form') {
    const loc = new URL(window.location.href);
    form.querySelector('#owner').value = loc.searchParams.get('owner') || '';
    form.querySelector('#installationId').value = loc.searchParams.get('id') || '';
  }
}

/**
 * We create the form and add the submit button and input text field to it.
 */
async function createForm(formURL) {
  const { pathname } = new URL(formURL);
  const resp = await fetch(pathname);
  const json = await resp.json();
  const form = document.createElement('form');
  // eslint-disable-next-line prefer-destructuring
  form.dataset.action = pathname.split('.json')[0];
  json.data.forEach((field) => {
    field.Type = field.Type || 'text';
    const fieldWrapper = document.createElement('div');
    const style = field.Style ? ` form-${field.Style}` : '';
    const fieldId = `form-${field.Type}-wrapper${style}`;
    fieldWrapper.className = fieldId;
    fieldWrapper.classList.add('field-wrapper');
    switch (field.Type) {
      case 'submit':
        fieldWrapper.append(createButton(field));
        break;
      default:
        fieldWrapper.append(createInput(field));
    }
    form.append(fieldWrapper);
  });

  fill(form);
  return form;
}

const init = async (el) => {
  const form = el.querySelector('a[href$=".json"]');
  if (form) {
    form.replaceWith(await createForm(form.href));
  }
};

export default init;
