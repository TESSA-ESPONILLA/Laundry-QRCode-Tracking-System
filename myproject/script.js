let laundryData = {};

function loadData() {
    fetch('laundryData.json')
        .then(response => response.json())
        .then(data => {
            laundryData = data;
            loadOrdersTable();
        })
        .catch(err => console.error('Failed to load JSON:', err));
}
function saveTransaction() {
    const customerName = document.getElementById('customerName').value.trim();
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    const serviceType = document.getElementById('serviceType').value;
    const weight = parseFloat(document.getElementById('weight').value);
    const pickupDate = document.getElementById('pickupDate').value;
    const pickupTime = document.getElementById('pickupTime').value;
    const instructions = document.getElementById('instructions').value.trim();

    if (!customerName || !phoneNumber || !serviceType || !weight || !pickupDate || !pickupTime) {
        alert('Please fill in all required fields.');
        return;
    }

    const trackingCode = generateTrackingCode(); 
    const transaction = {
        trackingCode,
        customerName,
        phoneNumber,
        serviceType,
        weight,
        pickupDate,
        pickupTime,
        instructions,
        status: 'Pending'
    };

   
    laundryData[trackingCode] = transaction;
    saveData(); 

    alert('Transaction saved successfully!');
    document.getElementById('newTransactionForm').reset();
    loadOrdersTable();
}


function generateTrackingCode() {
    return 'LT-' + Date.now();
}

function showAdminSection(sectionId, event) {
    document.querySelectorAll('.admin-section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';

    document.querySelectorAll('.btn-group .btn').forEach(btn => {
        btn.classList.remove('active', 'btn-gradient');
        btn.classList.add('btn-outline-light');
    });

    if (event) {
        event.target.classList.add('active', 'btn-gradient');
        event.target.classList.remove('btn-outline-light');
    }

    if (sectionId === 'manageOrders') {
        loadOrdersTable();
    }
}

document.getElementById('newTransactionForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const trackingCode = generateTrackingCode();
    const formData = {
        trackingCode,
        customerName: document.getElementById('customerName').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        serviceType: document.getElementById('serviceType').value,
        weight: document.getElementById('weight').value,
        pickupDate: document.getElementById('pickupDate').value,
        pickupTime: document.getElementById('pickupTime').value,
        instructions: document.getElementById('instructions').value,
        status: "Processing"
    };

    laundryData[trackingCode] = formData;
    saveData();

    
    showAdminSection('generateQR');
    document.getElementById('qrTrackingCode').value = trackingCode;
    generateQR();
});

function generateQR() {
    const trackingCode = document.getElementById('qrTrackingCode').value.trim();
    if (!trackingCode) return;

    const canvas = document.getElementById('qrCanvas');
    QRCode.toCanvas(canvas, trackingCode, error => {
        if (error) console.error(error);
        document.getElementById('qrCodeDisplay').style.display = 'block';
        document.getElementById('qrActions').style.display = 'block';
        document.getElementById('qrTrackingText').textContent = trackingCode;
    });
}

function printQR() {
    const canvas = document.getElementById('qrCanvas');
    const dataUrl = canvas.toDataURL();

    const win = window.open();
    win.document.write(`<img src="${dataUrl}" onload="window.print();window.close()">`);
}

function downloadQR() {
    const canvas = document.getElementById('qrCanvas');
    const link = document.createElement('a');
    link.download = 'qr-code.png';
    link.href = canvas.toDataURL();
    link.click();
}

function loadOrdersTable() {
    const tbody = document.getElementById('ordersTableBody');
    tbody.innerHTML = ''; 

    Object.values(laundryData).forEach(order => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${order.trackingCode}</td>
            <td>${order.customerName}</td>
            <td>${getServiceTypeName(order.serviceType)}</td>
            <td>${order.status || 'Pending'}</td>
            <td>${order.pickupDate} ${order.pickupTime}</td>
            <td>
                <button class="btn btn-sm btn-success mark-done" data-code="${order.trackingCode}">Mark Done</button>
                <button class="btn btn-sm btn-danger delete-order" data-code="${order.trackingCode}">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

   
    document.querySelectorAll('.mark-done').forEach(button => {
        button.addEventListener('click', function () {
            const trackingCode = this.getAttribute('data-code');
            if (laundryData[trackingCode]) {
                laundryData[trackingCode].status = 'Done';
                saveData();
                loadOrdersTable();
            }
        });
    });

    document.querySelectorAll('.delete-order').forEach(button => {
        button.addEventListener('click', function () {
            const trackingCode = this.getAttribute('data-code');
            if (confirm(`Are you sure you want to delete transaction ${trackingCode}?`)) {
                deleteOrder(trackingCode);
            }
        });
    });
}





function deleteOrder(trackingCode) {
    delete laundryData[trackingCode];
    saveData();
    loadOrdersTable();
}

function editOrder(trackingCode) {
    const order = laundryData[trackingCode];
    alert("Edit feature is not implemented yet for: " + trackingCode);
}

  function getServiceTypeName(serviceType) {
      const serviceMap = {
          'wash-only': 'Wash Only',
          'wash-dry': 'Wash & Dry',
          'dry-clean': 'Dry Clean',
          'iron-only': 'Iron Only'
      };
      return serviceMap[serviceType] || serviceType;
  }
  document.addEventListener('DOMContentLoaded', function () {
      loadData();
      loadOrdersTable();
  });
