(defun random () (n-call (n-get (n-global Math) 'random)))
(defun floor () (n-call (n-get (n-global Math) 'floor)))
(defun ceil () (n-call (n-get (n-global Math) 'ceil)))
(defun log (a) (n-call (n-get (n-global 'console) 'log) a))
