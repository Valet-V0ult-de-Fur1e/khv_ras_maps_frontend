
// 5 след. функций подключаем к кнопкам (к полигонам) в качестве параметра onclick="" в html
// чтобы работало переключение между секциями в левом навбаре
function showInitialSection() {
    document.getElementById('initial-section').style.display = 'block';
    document.getElementById('filter-section').style.display = 'none';
    document.getElementById('poligon-operations-section').style.display = 'none';
    document.getElementById('emptiness-section').style.display = 'none';
    document.getElementById('selecting-polygons').style.display = 'none';
    document.getElementById('editing-field').style.display = 'none';

    document.getElementById('ndviToggleBtn').style.display = 'none';
}

function showFilterSection() {
    document.getElementById('initial-section').style.display = 'none';
    document.getElementById('filter-section').style.display = 'block';
    document.getElementById('poligon-operations-section').style.display = 'none';
    document.getElementById('emptiness-section').style.display = 'none';
    document.getElementById('selecting-polygons').style.display = 'none';
    document.getElementById('editing-field').style.display = 'none';
}

function showPolygonSection() {
    document.getElementById('initial-section').style.display = 'none';
    document.getElementById('filter-section').style.display = 'none';
    document.getElementById('poligon-operations-section').style.display = 'block';
    document.getElementById('emptiness-section').style.display = 'none';
    document.getElementById('selecting-polygons').style.display = 'none';
    document.getElementById('editing-field').style.display = 'none';
}

function showSelectingPolygonsSection() {
    document.getElementById('initial-section').style.display = 'none';
    document.getElementById('filter-section').style.display = 'none';
    document.getElementById('poligon-operations-section').style.display = 'none';
    document.getElementById('emptiness-section').style.display = 'none';
    document.getElementById('selecting-polygons').style.display = 'block';
    document.getElementById('editing-field').style.display = 'none';
}

function showEditingFieldSection() {
    document.getElementById('initial-section').style.display = 'none';
    document.getElementById('filter-section').style.display = 'none';
    document.getElementById('poligon-operations-section').style.display = 'none';
    document.getElementById('emptiness-section').style.display = 'none';
    document.getElementById('selecting-polygons').style.display = 'none';
    document.getElementById('editing-field').style.display = 'block';
}

// функция для открытия/закрытия ndvi-менюшки
document.addEventListener('DOMContentLoaded', function() {
    const ndviToggleBtn = document.getElementById('ndviToggleBtn');
    const ndviMenu = document.getElementById('ndviMenu');

    document.querySelector('.btn-display-ndvi').addEventListener('click', function() {
        ndviToggleBtn.style.display = 'block';
        document.getElementById('initial-section').style.display = 'none';
        document.getElementById('filter-section').style.display = 'none';
        document.getElementById('poligon-operations-section').style.display = 'none';
        document.getElementById('emptiness-section').style.display = 'block';
    });
    function toggleNdviMenu() {
        ndviMenu.classList.toggle('show');
    }
    window.toggleNdviMenu = toggleNdviMenu;
});

// это функции для вкладок и карт, реализовано только открытие вкладки и ее удаление
function showMap(mapId) {
    const maps = document.querySelectorAll('.map');
    maps.forEach(map => {
        if (map.id === mapId) {
            map.classList.add('active');
        } else {
            map.classList.remove('active');
        }
    });

    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        if (tab.id === `tab-${mapId}`) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
}

function closeTab(event, mapId) {
    event.stopPropagation();
    document.getElementById(mapId).remove();
    document.getElementById(`tab-${mapId}`).remove();

    const firstTab = document.querySelector('.tab-btn');
    if (firstTab) {
        firstTab.classList.add('active');
        showMap(firstTab.id.replace('tab-', ''));
    }
}