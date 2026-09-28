// Имитация ответа сервера
function fakeFetch(url) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Анализируем, какой ID передали в URL
            if (url.includes('/students/')) {
                const id = url.split('/').pop();
                // Пусть студент с ID 1 — иногородний, а с другими ID — местный
                resolve({
                    json: async () => ({ isNonResident: id === "1" })
                });
            } 
            else if (url.includes('/buildings/')) {
                const id = url.split('/').pop();
                // Пусть корпус 1 — для студентов, а остальные — нет
                resolve({
                    json: async () => ({ isForStudents: id === "1" })
                });
            } 
            else if (url.includes('/rooms/')) {
                const id = url.split('/').pop();
                // Пусть комната 101 — свободна, остальные — нет
                resolve({
                    json: async () => ({ isFree: id === "101" })
                });
            } 
            else {
                reject(new Error("404 Not Found"));
            }
        }, 300);
    });
}

document.getElementById('dormForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const studentId = document.getElementById('studentId').value;
    const buildingNum = document.getElementById('buildingNum').value;
    const roomNum = document.getElementById('roomNum').value;
    const statusDiv = document.getElementById('statusMessage');

    try {
        // 1. Запрос студента
        const studentRes = await fakeFetch(`/api/students/${studentId}`);
        const student = await studentRes.json();

        if (!student.isNonResident) {
            statusDiv.textContent = "Отказ (студент не иногородний)";
            statusDiv.className = "status error";
            return;
        }

        // 2. Запрос корпуса
        const buildingRes = await fakeFetch(`/api/buildings/${buildingNum}`);
        const building = await buildingRes.json();

        if (!building.isForStudents) {
            statusDiv.textContent = "Отказ (корпус не для студентов)";
            statusDiv.className = "status error";
            return;
        }

        // 3. Запрос комнаты
        const roomRes = await fakeFetch(`/api/rooms/${roomNum}`);
        const room = await roomRes.json();

        if (!room.isFree) {
            statusDiv.textContent = "Отказ (комната занята)";
            statusDiv.className = "status error";
            return;
        }

        // Если все 3 этапа пройдены:
        statusDiv.textContent = "Все окей";
        statusDiv.className = "status success";

    } catch (err) {
        statusDiv.textContent = "Ошибка связи с сервером";
        statusDiv.className = "status error";
    }
});