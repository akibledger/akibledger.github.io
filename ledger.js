const form = document.getElementById('entry-form');
const typeEl = document.getElementById('type');
const nameEl = document.getElementById('name');
const amtEl = document.getElementById('amount');
const whyEl = document.getElementById('reason');
const list = document.getElementById('entries');

let entries = JSON.parse(localStorage.getItem('entries')||'[]');

function render() {
  list.innerHTML = '';
  entries.forEach((e,i) => {
    const li = document.createElement('li');
    li.className = e.type;
    li.textContent = `${e.type==='get'?'+':'–'} ${e.name}: ${e.amount} (${e.reason})`;
    li.addEventListener('click',()=>{ entries.splice(i,1); saveAndRender(); });
    list.append(li);
  });
}

function saveAndRender() {
  localStorage.setItem('entries', JSON.stringify(entries));
  render();
}

form.addEventListener('submit', e => {
  e.preventDefault();
  entries.push({
    type:   typeEl.value,
    name:   nameEl.value.trim(),
    amount: parseFloat(amtEl.value),
    reason: whyEl.value.trim()
  });
  nameEl.value = amtEl.value = whyEl.value = '';
  saveAndRender();
});

render();
