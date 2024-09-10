export default function registerAAUniversity() {
  const firstName = document.querySelector('input[name="FirstName"]');
  const lastName = document.querySelector('input[name="LastName"]');
  const email = document.querySelector('input[name="Email"]');
  const country = document.querySelector('select[name="Country"]');

  fetch('https://us-central1-adobe---aa-university.cloudfunctions.net/register', {
    method: 'POST',
    body: JSON.stringify({
      first_name: firstName?.value,
      last_name: lastName?.value,
      email: email?.value,
      university: 'none',
      country: country?.value,
    }),
  })
    .catch((error) => window.lana.log(`Marketo AA University Error: ${error}`));
}
