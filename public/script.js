document.getElementById('start').addEventListener('click', async () => {
    let res = await fetch('/api/server/start');
    if(res.ok) {
        location.reload();
    } else {
        let data = await res.json();
        alert(data.message);
    }
});

document.getElementById('stop').addEventListener('click', async () => {
    let res = await fetch('/api/server/stop');
    if(res.ok) {
        location.reload();
    } else {
        let data = await res.json();
        alert(data.message);
    }
});