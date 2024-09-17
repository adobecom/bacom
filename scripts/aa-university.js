export default function registerAAUniversity() {
  const firstName = document.querySelector('input[name="FirstName"]');
  const lastName = document.querySelector('input[name="LastName"]');
  const email = document.querySelector('input[name="Email"]');
  const country = document.querySelector('select[name="Country"]');
  const group = document.querySelector('meta[name="sandboxgroup"]');

  const postBody = {
    first_name: firstName?.value,
    last_name: lastName?.value,
    email: email?.value,
    university: 'none',
    country: country?.value,
  };

  if (group) postBody.group = group.content;

  fetch('https://us-central1-adobe---aa-university.cloudfunctions.net/register', {
    method: 'POST',
    body: JSON.stringify(postBody),
  })
    .catch((error) => window.lana.log(`Marketo AA University Error: ${error}`));

  return postBody;
}
