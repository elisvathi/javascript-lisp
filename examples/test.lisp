(require examples/stdlib.lisp)
(require examples/native.lisp)
(require examples/http.lisp)

(defvar lst (list 3 8 2 1))

;; (random)
;; (msort (list (random) (random) (random)))
;; (ceil. (random))
;; (reverse (list a b c))

(defun factorial (n)
  (cond
   ((= n 0) 1)
   ('t (* n (factorial (- n 1))))))

(factorial 3)
(n-call (n-get server 'listen) 8000)
;; (map factorial lst)
;; (log (msort lst))
;; http-module
