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
        const patientName = document.getElementById('patientNameInput').value.trim();
        const patientMobile = document.getElementById('patientMobileInput').value.trim();
        const overallRating = document.getElementById('overallRatingInput').value;

        if (!branchCheck || !patientName || !patientMobile || overallRating == 0) {
            alert("يرجى التأكد من ملء جميع البيانات والتقييم واختيار الفرع قبل الإرسال.");
            return;
        }

        if (patientMobile.length < 11) {
            alert("رقم المحمول يجب أن يكون 11 رقماً على الأقل.");
            return;
        }

        // تغيير حالة الزر
        submitBtn.innerText = 'جاري الإرسال بآمان... ⏳';
        submitBtn.disabled = true;

        const formData = new FormData(form);

        // Add dummy values for removed columns to avoid breaking Google Apps Script
        formData.append('ReceptionRating', overallRating);
        formData.append('NursingRating', overallRating);
        formData.append('DoctorsRating', overallRating);
        formData.append('EquipmentRating', overallRating);
        formData.append('CleaningRating', overallRating);
        formData.append('HandoverRating', overallRating);
        formData.append('PatientBarcode', 'لا يوجد');

        fetch(scriptURL, { method: 'POST', body: formData })
            .then(response => {
                // إظهار رسالة النجاح
                document.getElementById('successMessage').style.display = 'block';
                document.getElementById('errorMessage').style.display = 'none';

                // تفريغ النموذج برمجياً
                form.reset();
                document.querySelectorAll('input[type="hidden"]').forEach(input => input.value = 0);
                document.querySelectorAll('.emoji-wrapper').forEach(e => e.classList.remove('selected'));

                // العودة للحالة الأساسية
                setTimeout(() => {
                    document.getElementById('successMessage').style.display = 'none';
                    submitBtn.innerText = 'إرسال التقييم الآن';
                    submitBtn.disabled = false;
                    window.scrollTo({ top: 0, behavior: 'smooth' });
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
