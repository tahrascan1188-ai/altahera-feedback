document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // منطق التقييم بالإيموجي 3D
    // ==========================================
    const ratingGroups = document.querySelectorAll('.rating-group');

    ratingGroups.forEach(group => {
        const emojis = group.querySelectorAll('.emoji-wrapper');
        const hiddenInput = group.querySelector('input[type="hidden"]');

        emojis.forEach(emoji => {
            emoji.addEventListener('click', () => {
                // إزالة التحديد السابق في نفس المجموعة
                emojis.forEach(e => e.classList.remove('selected'));

                // إضافة التحديد للعنصر الحالي
                emoji.classList.add('selected');

                // تحديث القيمة المخفية
                hiddenInput.value = emoji.getAttribute('data-value');
            });
        });
    });

    // ==========================================
    // نموذج الإرسال لجوجل شيت 
    // ==========================================
    const form = document.getElementById('feedbackForm');
    const submitBtn = document.getElementById('submitBtn');

    // === 🛑 رابط Google Apps Script الخاص بك 🛑 ===
    const scriptURL = 'https://script.google.com/macros/s/AKfycbz0GPOtk8kI7Fr4cbw8bk0OpcZxFzhYd4sZwjgxV1TEXZE5MttJfB_thGZ_0JcTl33XnA/exec';

    form.addEventListener('submit', e => {
        e.preventDefault();

        // التأكد من أن المستخدم قيّم الخيارات المطلوبة
        const branchCheck = document.getElementById('branchSelect').value;
        const barcodeVal = document.getElementById('patientBarcodeInput').value;
        const receptionRating = document.getElementById('receptionRatingInput').value;
        const nursingRating = document.getElementById('nursingRatingInput').value;
        const doctorsRating = document.getElementById('doctorsRatingInput').value;
        const equipmentRating = document.getElementById('equipmentRatingInput').value;
        const cleaningRating = document.getElementById('cleaningRatingInput').value;
        const handoverRating = document.getElementById('handoverRatingInput').value;

        if (!branchCheck || !barcodeVal || receptionRating == 0 || nursingRating == 0 || doctorsRating == 0 || equipmentRating == 0 || cleaningRating == 0 || handoverRating == 0) {
            alert("يرجى التأكد من اختيار الفرع ومسح كود المريض واختيار تقييم في جميع الخطوات قبل الإرسال.");
            return;
        }

        // تغيير حالة الزر
        submitBtn.innerText = 'جاري الإرسال بآمان... ⏳';
        submitBtn.disabled = true;

        const formData = new FormData(form);

        fetch(scriptURL, { method: 'POST', body: formData })
            .then(response => {
                // إظهار رسالة النجاح
                document.getElementById('successMessage').style.display = 'block';
                document.getElementById('errorMessage').style.display = 'none';

                // تفريغ النموذج برمجياً
                form.reset();
                document.querySelectorAll('input[type="hidden"]').forEach(input => input.value = 0);
                document.querySelectorAll('.emoji-wrapper').forEach(e => e.classList.remove('selected'));

                // العودة للخطوة الأولى
                setTimeout(() => {
                    document.getElementById('successMessage').style.display = 'none';
                    currentStep = 1;
                    showStep(currentStep);
                    submitBtn.innerText = 'إرسال التقييم الآن';
                    submitBtn.disabled = false;
                }, 4000);
            })
            .catch(error => {
                // إظهار رسالة الخطأ
                document.getElementById('errorMessage').style.display = 'block';
                submitBtn.innerText = 'إرسال التقييم الآن';
                submitBtn.disabled = false;
                console.error('Error!', error.message);
            });
    });
});

// ==========================================
// منطق التنقل بين الخطوات (Multi-step)
// ==========================================
let currentStep = 1;
const totalSteps = 8; // تحديث إجمالي الخطوات بعد إضافة الفئات الجديدة

// تحديث شريط التقدم
function updateProgressBar() {
    const progress = (currentStep / totalSteps) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
}

function showStep(stepIndex) {
    // إخفاء جميع الخطوات
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });

    // إظهار الخطوة المطلوبة
    document.getElementById(`step-${stepIndex}`).classList.add('active');
    updateProgressBar();
}

function nextStep(stepIndex) {
    // التحقق من الحقول المطلوبة لكل خطوة على حدة
    let ratingInputId = null;

    // تحقق من الفرع وكود المريض ورقم المحمول في الخطوة الأولى
    if (stepIndex === 1) {
        const branchCheck = document.getElementById('branchSelect').value;
        if (!branchCheck) {
            alert("يرجى اختيار الفرع أولاً.");
            return;
        }

        const barcodeVal = document.getElementById('patientBarcodeInput').value.trim();
        if (!barcodeVal) {
            alert("يرجى إدخال أو مسح كود المريض.");
            return;
        }

        const mobileVal = document.getElementById('patientMobileInput').value.trim();
        if (!mobileVal) {
            alert("يرجى إدخال رقم المحمول.");
            return;
        }
        if (mobileVal.length < 11) {
            alert("رقم المحمول يجب أن يكون 11 رقماً على الأقل.");
            return;
        }
    }

    switch (stepIndex) {
        case 2: ratingInputId = 'receptionRatingInput'; break;
        case 3: ratingInputId = 'nursingRatingInput'; break;
        case 4: ratingInputId = 'doctorsRatingInput'; break;
        case 5: ratingInputId = 'equipmentRatingInput'; break;
        case 6: ratingInputId = 'cleaningRatingInput'; break;
        case 7: ratingInputId = 'handoverRatingInput'; break;
    }

    if (ratingInputId && document.getElementById(ratingInputId).value == 0) {
        alert("يرجى اختيار تقييم قبل الانتقال للخطوة التالية.");
        return;
    }

    if (currentStep < totalSteps) {
        currentStep++;
        showStep(currentStep);
    }
}

function prevStep(stepIndex) {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
    }
}

// ==========================================
// منطق قراءة الباركود (Barcode Scanner)
// ==========================================
let html5QrcodeScanner = null;

function startScanner() {
    const readerContainer = document.getElementById('reader-container');
    const btnScan = document.getElementById('btnScan');

    // إظهار حاوية الكاميرا وإخفاء زر المسح
    readerContainer.style.display = 'block';
    btnScan.style.display = 'none';

    html5QrcodeScanner = new Html5Qrcode("reader");

    const qrCodeSuccessCallback = (decodedText, decodedResult) => {
        // عند نجاح القراءة
        document.getElementById('patientBarcodeInput').value = decodedText;
        stopScanner(); // إيقاف الكاميرا تلقائياً

        // تأثير بصري للنجاح
        const inputField = document.getElementById('patientBarcodeInput');
        inputField.style.borderColor = '#198754';
        inputField.style.boxShadow = '0 0 0 4px rgba(25, 135, 84, 0.2)';
        setTimeout(() => {
            inputField.style.borderColor = '';
            inputField.style.boxShadow = '';
        }, 1500);
    };

    const config = { fps: 10, qrbox: { width: 250, height: 100 }, aspectRatio: 1.0 };

    // تشغيل الكاميرا الخلفية تلقائياً إن وجدت
    html5QrcodeScanner.start({ facingMode: "environment" }, config, qrCodeSuccessCallback)
        .catch((err) => {
            console.error("Error starting scanner: ", err);
            alert("تعذر الوصول للكاميرا. يرجى إدخال الكود يدوياً.");
            stopScanner();
        });
}

function stopScanner() {
    const readerContainer = document.getElementById('reader-container');
    const btnScan = document.getElementById('btnScan');

    if (html5QrcodeScanner) {
        html5QrcodeScanner.stop().then(() => {
            html5QrcodeScanner.clear();
            readerContainer.style.display = 'none';
            btnScan.style.display = 'flex'; // إعادة إظهار زر المسح
        }).catch(err => {
            console.error("Failed to stop scanner: ", err);
            readerContainer.style.display = 'none';
            btnScan.style.display = 'flex';
        });
    } else {
        readerContainer.style.display = 'none';
        btnScan.style.display = 'flex';
    }
}
