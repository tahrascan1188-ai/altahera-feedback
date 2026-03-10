document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // شاشة البداية (Splash Screen) ومنطق الدخول
    // ==========================================
    const splashScreen = document.getElementById('splashScreen');
    const mainCard = document.getElementById('mainCard');

    splashScreen.addEventListener('click', () => {
        // إضافة الكلاس لإخفاء الشاشة بأنيميشن
        splashScreen.classList.add('hidden');

        // بعد انتهاء الأنيميشن، إخفاء العنصر نهائياً وعرض الفورم
        setTimeout(() => {
            splashScreen.style.display = 'none';
            mainCard.style.display = 'block';

            // استخدام requestAnimationFrame لضمان الـ render قبل بدء الأنيميشن
            requestAnimationFrame(() => {
                mainCard.classList.add('show');
            });

        }, 600); // يتطابق مع الـ transition في الـ CSS
    });

    // ==========================================
    // تجربة الكيبورد الاحترافية (Virtual Tech Keyboard)
    // ==========================================
    const allInputs = document.querySelectorAll('input[type="text"], input[type="tel"], textarea');
    const virtualKeyboard = document.getElementById('virtualKeyboard');
    const vkKeysContainer = document.getElementById('vkKeysContainer');
    const vkCloseBtn = document.getElementById('vkCloseBtn');

    let activeInput = null;

    // تعريف لوحة المفاتيح بناءً على نوع الحقل (نصي أم رقمي)
    const numberLayout = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'مسح', '0', 'إدخال'];

    // تم إضافة الأسهم الأربعة لتسهيل التنقل
    const textLayout = [
        'د', 'ج', 'ح', 'خ', 'ه', 'ع', 'غ', 'ف', 'ق', 'ث', 'ص', 'ض',
        'ط', 'ك', 'م', 'ن', 'ت', 'ا', 'ل', 'ب', 'ي', 'س', 'ش', 'ظ',
        'ز', 'و', 'ة', 'ى', 'لا', 'ر', 'ؤ', 'ء', 'ئ', 'مسافة', 'مسح', 'إدخال',
        '⬅️', '⬇️', '⬆️', '➡️'
    ];

    function renderKeyboard(layout) {
        vkKeysContainer.innerHTML = '';

        // تعديل الشبكة بناءً على النوع
        if (layout === numberLayout) {
            vkKeysContainer.style.gridTemplateColumns = 'repeat(3, 1fr)';
        } else {
            vkKeysContainer.style.gridTemplateColumns = 'repeat(6, 1fr)';
        }

        layout.forEach(key => {
            const keyElement = document.createElement('div');
            keyElement.classList.add('vk-key');
            keyElement.textContent = key;

            if (key === 'مسح') {
                keyElement.classList.add('action-key', 'delete-key');
            } else if (key === 'إدخال') {
                keyElement.classList.add('action-key', 'enter-key');
            } else if (key === 'مسافة') {
                keyElement.classList.add('action-key');
                keyElement.style.gridColumn = 'span 4'; // زر المسافة أعرض
            } else if (['⬅️', '⬇️', '⬆️', '➡️'].includes(key)) {
                keyElement.classList.add('action-key', 'arrow-key');
            }

            // إضافة تفاعل الزر
            keyElement.addEventListener('mousedown', (e) => {
                e.preventDefault(); // الأهم: منع فقدان التركيز (focus) حتى يظل المؤشر يعمل
            });

            keyElement.addEventListener('click', (e) => {
                e.preventDefault();
                if (!activeInput) return;

                // الحصول على موضع المؤشر الحالي
                let startPos = activeInput.selectionStart;
                let endPos = activeInput.selectionEnd;

                if (key === 'مسح') {
                    if (startPos > 0) {
                        const val = activeInput.value;
                        activeInput.value = val.slice(0, startPos - 1) + val.slice(endPos);
                        activeInput.setSelectionRange(startPos - 1, startPos - 1);
                    }
                } else if (key === 'إدخال') {
                    closeVirtualKeyboard();
                } else if (key === '➡️') {
                    // يسار عربي (تحريك المؤشر لليمين في السياق الإنجليزي، والعكس في العربي)
                    // في النصوص العربية (RTL)، التحصين لليسار يعني التقدم في النص
                    activeInput.setSelectionRange(startPos + 1, startPos + 1);
                } else if (key === '⬅️') {
                    if (startPos > 0) activeInput.setSelectionRange(startPos - 1, startPos - 1);
                } else if (key === '⬆️') {
                    activeInput.setSelectionRange(0, 0); // أول النص
                } else if (key === '⬇️') {
                    activeInput.setSelectionRange(activeInput.value.length, activeInput.value.length); // آخر النص
                } else {
                    // إدراج نص عادي
                    const charToInsert = (key === 'مسافة') ? ' ' : key;
                    const val = activeInput.value;
                    activeInput.value = val.slice(0, startPos) + charToInsert + val.slice(endPos);

                    // تحريك المؤشر للأمام بعد الإدخال
                    activeInput.setSelectionRange(startPos + charToInsert.length, startPos + charToInsert.length);
                }
            });

            vkKeysContainer.appendChild(keyElement);
        });
    }

    function openVirtualKeyboard(inputElement) {
        activeInput = inputElement;

        // لا نقوم بوضع readonly هنا لأننا نحتاج المؤشر (Caret) للتنقل باستخدام الأسهم
        // سنعتمد على e.preventDefault() في mousedown و touchstart لمنع الكيبورد الأصلية

        // اختيار التخطيط المناسب وتكوين الكيبورد
        const layout = (activeInput.type === 'tel') ? numberLayout : textLayout;
        renderKeyboard(layout);

        // إضافة مساحة للـ body أولاً لمنع الاختفاء تحت الكيبورد
        document.body.classList.add('keyboard-active');

        // عرض الكيبورد
        virtualKeyboard.classList.add('active');

        // رفع الحقل ليكون مرئي بوضوح
        setTimeout(() => {
            const rect = activeInput.getBoundingClientRect();
            // نحسب المسافة عشان الخلية تكون ظاهرة بوضوح
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const targetY = rect.top + scrollTop - (window.innerHeight / 3);

            window.scrollTo({
                top: targetY,
                behavior: 'smooth'
            });

            // إضافة تأثير بصري للتركيز على الخلية
            activeInput.style.transform = 'scale(1.02)';
            activeInput.style.boxShadow = '0 0 15px rgba(138, 42, 116, 0.3)';
            activeInput.style.border = '2px solid var(--primary)';

            // التركيز على الحقل لظهور المؤشر في نهايته
            activeInput.focus();
            const len = activeInput.value.length;
            activeInput.setSelectionRange(len, len);

        }, 350); // ننتظر حتى يبدأ الأنيميشن
    }

    function closeVirtualKeyboard() {
        virtualKeyboard.classList.remove('active');
        document.body.classList.remove('keyboard-active');

        if (activeInput) {
            // إزالة التأثير البصري
            activeInput.style.transform = '';
            activeInput.style.boxShadow = '';
            activeInput.style.border = '';

            activeInput.blur(); // إزالة التركيز نهائياً
            activeInput = null;
        }
    }

    // ربط الأحداث للحقول المستهدفة
    allInputs.forEach(input => {
        // نستخدم mousedown و touchstart لمنع السلوك الافتراضي قبل ال focus
        input.addEventListener('mousedown', (e) => {
            e.preventDefault();
            openVirtualKeyboard(input);
        });

        input.addEventListener('touchstart', (e) => {
            e.preventDefault();
            openVirtualKeyboard(input);
        });
    });

    // إغلاق الكيبورد عند الضغط على زر X
    vkCloseBtn.addEventListener('click', closeVirtualKeyboard);

    // إغلاق الكيبورد إذا تم الضغط خارج الحقول أو الكيبورد نفسه
    document.addEventListener('mousedown', (e) => {
        if (activeInput && e.target !== activeInput && !virtualKeyboard.contains(e.target)) {
            closeVirtualKeyboard();
        }
    });

    document.addEventListener('touchstart', (e) => {
        if (activeInput && e.target !== activeInput && !virtualKeyboard.contains(e.target)) {
            closeVirtualKeyboard();
        }
    });

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
