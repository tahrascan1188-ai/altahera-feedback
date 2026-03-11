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
    // حالة لغة الكيبورد الحالية (العربية افتراضياً)
    let currentLang = 'ar';
    let isCapsOn = false;

    // تعريف لوحة المفاتيح الافتراضية بشكل شبيه بكيبورد الكمبيوتر (PC Layout)
    const pcNumberLayout = [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
        ['مسح', '0', 'إدخال']
    ];

    const pcTextLayoutAr = [
        ['Esc', 'ذ', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'مسح'],
        ['Tab', 'ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د', '\\', 'Del'],
        ['Caps', 'ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط', 'إدخال'],
        ['Shift', 'ئ', 'ء', 'ؤ', 'ر', 'لا', 'ى', 'ة', 'و', 'ز', 'ظ', 'Shift'],
        ['Fn', 'Ctrl', '🌐', 'Alt', 'مسافة', 'Alt', 'Ctrl', '⬅️', '⬇️', '⬆️', '➡️']
    ];

    const pcTextLayoutEn = [
        ['Esc', '`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
        ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\', 'Del'],
        ['Caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\'', 'Enter'],
        ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'Shift'],
        ['Fn', 'Ctrl', '🌐', 'Alt', 'Space', 'Alt', 'Ctrl', '⬅️', '⬇️', '⬆️', '➡️']
    ];

    function renderKeyboard(layoutRows) {
        vkKeysContainer.innerHTML = '';
        vkKeysContainer.className = 'vk-keys-pc';

        layoutRows.forEach(row => {
            const rowElement = document.createElement('div');
            rowElement.classList.add('vk-row');

            row.forEach(key => {
                const keyElement = document.createElement('div');
                keyElement.classList.add('vk-key');
                keyElement.textContent = key;

                // Handle special classes
                if (key === 'مسح' || key === 'Backspace') {
                    keyElement.classList.add('action-key', 'delete-key', 'wide-key');
                    keyElement.innerHTML = '&#9003;'; // Backspace symbol
                } else if (key === 'إدخال' || key === 'Enter') {
                    keyElement.classList.add('action-key', 'enter-key', 'wide-key');
                    keyElement.textContent = 'Enter';
                } else if (key === 'مسافة' || key === 'Space') {
                    keyElement.classList.add('action-key', 'space-key');
                    keyElement.textContent = '';
                } else if (key === '🌐') {
                    keyElement.classList.add('action-key', 'lang-key');
                    keyElement.textContent = currentLang === 'ar' ? 'En' : 'عربي';
                    keyElement.style.color = '#fff';
                    keyElement.style.background = 'var(--primary)';
                } else if (['Shift', 'Caps', 'Tab', 'Esc', 'Del', 'Fn', 'Ctrl', 'Win', 'Alt'].includes(key)) {
                    keyElement.classList.add('action-key', 'modifier-key');
                    if (['Shift', 'Caps', 'Tab'].includes(key)) keyElement.classList.add('wide-key');
                    if (key === 'Caps' && isCapsOn) keyElement.style.background = 'var(--primary)';
                } else if (['⬅️', '⬇️', '⬆️', '➡️'].includes(key)) {
                    keyElement.classList.add('action-key', 'arrow-key');
                } else if (isCapsOn && currentLang === 'en' && /^[a-z]$/i.test(key)) {
                    // Update key display if caps lock is on
                    keyElement.textContent = key.toUpperCase();
                }

                // إضافة تفاعل الزر
                keyElement.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                });

                keyElement.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (!activeInput) return;

                    let startPos = activeInput.selectionStart;
                    let endPos = activeInput.selectionEnd;

                    if (key === '🌐') {
                        currentLang = currentLang === 'ar' ? 'en' : 'ar';
                        renderKeyboard(currentLang === 'ar' ? pcTextLayoutAr : pcTextLayoutEn);
                        activeInput.focus();
                        return;
                    }

                    if (key === 'Caps') {
                        isCapsOn = !isCapsOn;
                        renderKeyboard(currentLang === 'ar' ? pcTextLayoutAr : pcTextLayoutEn);
                        activeInput.focus();
                        return;
                    }

                    if (['Esc', 'Shift', 'Ctrl', 'Win', 'Alt', 'Fn', 'Tab', 'Del'].includes(key)) {
                        if (key === 'Del') {
                            if (startPos < activeInput.value.length) {
                                const val = activeInput.value;
                                activeInput.value = val.slice(0, startPos) + val.slice(startPos + 1);
                                activeInput.setSelectionRange(startPos, startPos);
                            }
                        } else if (key === 'Tab') {
                            const val = activeInput.value;
                            activeInput.value = val.slice(0, startPos) + '   ' + val.slice(endPos);
                            activeInput.setSelectionRange(startPos + 3, startPos + 3);
                        }
                        return;
                    }

                    if (key === 'مسح' || key === 'Backspace') {
                        if (startPos > 0) {
                            const val = activeInput.value;
                            activeInput.value = val.slice(0, startPos - 1) + val.slice(endPos);
                            activeInput.setSelectionRange(startPos - 1, startPos - 1);
                        }
                    } else if (key === 'إدخال' || key === 'Enter') {
                        closeVirtualKeyboard();
                    } else if (key === '➡️') {
                        // التحريك لليمين (يتقدم في الإنجليزي) ولكن في السياق العربي يختلف، هنا سيعتمد على اتجاه النص (RTL/LTR)
                        activeInput.setSelectionRange(startPos + 1, startPos + 1);
                    } else if (key === '⬅️') {
                        if (startPos > 0) activeInput.setSelectionRange(startPos - 1, startPos - 1);
                    } else if (key === '⬆️') {
                        activeInput.setSelectionRange(0, 0);
                    } else if (key === '⬇️') {
                        activeInput.setSelectionRange(activeInput.value.length, activeInput.value.length);
                    } else {
                        let charToInsert = (key === 'مسافة' || key === 'Space') ? ' ' : key;
                        if (isCapsOn && currentLang === 'en' && /^[a-z]$/i.test(key)) {
                            charToInsert = charToInsert.toUpperCase();
                        }

                        const val = activeInput.value;
                        activeInput.value = val.slice(0, startPos) + charToInsert + val.slice(endPos);
                        activeInput.setSelectionRange(startPos + charToInsert.length, startPos + charToInsert.length);
                    }
                });

                rowElement.appendChild(keyElement);
            });
            vkKeysContainer.appendChild(rowElement);
        });
    }

    function openVirtualKeyboard(inputElement) {
        if (activeInput === inputElement) return; // منع التكرار

        // إذا كان هناك حقل مفتوح بالفعل، نغلقه ونعيده لمكانه أولاً
        if (activeInput) {
            closeVirtualKeyboard(false); // false means don't hide the keyboard itself, just reset the input
        }

        activeInput = inputElement;

        // لا نقوم بوضع readonly هنا لأننا نحتاج المؤشر (Caret) للتنقل باستخدام الأسهم
        // سنعتمد على e.preventDefault() في mousedown و touchstart لمنع الكيبورد الأصلية

        // اختيار التخطيط المناسب وتكوين الكيبورد
        const layout = (activeInput.type === 'tel') ? pcNumberLayout : (currentLang === 'ar' ? pcTextLayoutAr : pcTextLayoutEn);
        renderKeyboard(layout);

        // إنشاء بديل (Placeholder) يحفظ مكان العنصر الأصلي في الصفحة
        inputPlaceholder = document.createElement(activeInput.tagName.toLowerCase());
        inputPlaceholder.className = activeInput.className + ' floating-input-placeholder';
        inputPlaceholder.style.height = activeInput.offsetHeight + 'px';
        inputPlaceholder.style.width = activeInput.offsetWidth + 'px';
        inputPlaceholder.style.margin = window.getComputedStyle(activeInput).margin;

        // إدراج البديل بعد العنصر مباشرة
        activeInput.parentNode.insertBefore(inputPlaceholder, activeInput.nextSibling);

        // نقل الخلية إلى الـ body لكي يعمل position: fixed بشكل صحيح نسبة للشاشة
        document.body.appendChild(activeInput);

        // إضافة مساحة للـ body أولاً لمنع الاختفاء تحت الكيبورد
        document.body.classList.add('keyboard-active');

        // عرض الكيبورد
        virtualKeyboard.classList.add('active');

        // رفع الحقل ليكون عائم (Floating)
        requestAnimationFrame(() => {
            // قياس ارتفاع الكيبورد لتحديد مكان الخلية
            const vkHeight = virtualKeyboard.offsetHeight || 300;
            document.documentElement.style.setProperty('--keyboard-top', vkHeight + 'px');

            activeInput.classList.add('floating-input-active');

            // التركيز على الحقل لظهور المؤشر في نهايته
            activeInput.focus();
            const len = activeInput.value.length;
            activeInput.setSelectionRange(len, len);
        });
    }

    function closeVirtualKeyboard(hideKeyboard = true) {
        if (!activeInput) return;

        // إزالة الكلاسات الخاصة بالعنصر العائم والـ body
        activeInput.classList.remove('floating-input-active');

        activeInput.blur(); // إزالة التركيز نهائياً

        // إزالة البديل (Placeholder) من الـ DOM وإعادة الخلية لمكانها
        if (inputPlaceholder && inputPlaceholder.parentNode) {
            inputPlaceholder.parentNode.insertBefore(activeInput, inputPlaceholder);
            inputPlaceholder.parentNode.removeChild(inputPlaceholder);
            inputPlaceholder = null;
        }

        activeInput = null;

        if (hideKeyboard) {
            document.body.classList.remove('keyboard-active');
            virtualKeyboard.classList.remove('active');

            // إخفاء الكيبورد بعد انتهاء حركة الانيميشن
            setTimeout(() => {
                if (!virtualKeyboard.classList.contains('active')) {
                    // reset something if needed
                }
            }, 400);
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

                // العودة للحالة الأساسية وشاشة البداية
                setTimeout(() => {
                    document.getElementById('successMessage').style.display = 'none';
                    submitBtn.innerText = 'إرسال التقييم الآن';
                    submitBtn.disabled = false;
                    window.scrollTo({ top: 0, behavior: 'smooth' });

                    // إخفاء الفورم
                    mainCard.classList.remove('show');

                    setTimeout(() => {
                        mainCard.style.display = 'none';

                        // إرجاع شاشة البداية
                        splashScreen.style.display = 'flex';
                        requestAnimationFrame(() => {
                            splashScreen.classList.remove('hidden');
                        });
                    }, 600); // وقت تأثير اختفاء الكارت

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
