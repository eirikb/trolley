const codes = document.querySelectorAll('.language-javascript');

for (let b of document.querySelectorAll('button')) {
  b.parentElement.removeChild(b);
}
for (let b of document.querySelectorAll('canvas')) {
  b.parentElement.removeChild(b);
}

for (let code of codes) {
  code.querySelector('.highlight').contentEditable = true;

  const canvas = document.createElement('canvas');
  canvas.style.display = 'none';
  canvas.width = 640;
  canvas.height = 480;

  const button = document.createElement('button');
  button.innerText = 'Run example';

  button.addEventListener('click', () => {
    const text = code.querySelector('code').innerText;
    new Function('trolley', 'canvas', text)(window.trolley, canvas);
    canvas.style.display = '';
  });

  code.appendChild(button);
  code.appendChild(canvas);
}
