(require examples/stdlib.lisp)
;; (require examples/raytracer/vector.lisp)
;; (require examples/raytracer/sphere.lisp)
;; (require examples/native.lisp)
;; (require examples/http.lisp)

;; (defvar lst (list 3 8 2 1))
;; (msort lst)
;; ;; (msort lst)
;; (lst)
;; (let (a 1) (b 2) (list a a a b))
;; (list a b)
;; ;; (defun lll (a) (let
;; ;;                  (x (* a 2))
;; ;;                  (y (* x 2))
;; ;;                  (list x x x y)))
;; ;; (lll 3)
;; (defun gtz (a) (> a 1))
;; (defun addone (a) (+ a 1))
;; (defvar lst (list 1 2 1 8 1 9 1 10 3 4))
;; ;; (map addone lst)
;; ;; (addone (car lst))
;; ;; (car lst)
;; ;; (filter gtz lst)
;; (mod 4 2)
;; (defun iseven (a) (eq (mod a 2) 0))
;; (defun isodd (a) (eq (mod a 2) 1))
;; (filter iseven lst)
;; (defun gtwo (a) (if (< a 2) 't '()))
;; (map gtwo lst)

;; Raytracer

;; (defvar v (vector/create 1 2 3))
;; (v/div (v/create 1 2 3) (v/create 1 2 3))
;; (v/mag (v/set-mag (v/create 1 1 1) 4.3))
;; (v/dot (v/create 1 1 1) (v/create 1 1 1))
;; (v/sum-squares (v/create 2 2 2))
;; (v/mag (v/scale (v/create 1 1 1) 2))
;; (sqrt 2)
;; (v/angle-between (v/create 1 0 0)
                 ;; (v/create 1 1 0))
;; (v/refract (v/create 0 1 1) (v/create 1 0 0) 0.1)
;; (v/inverse (v/create 1 1 1))

;; (gtwo 1)
;; (v/cross (v/create 1 0 0) (v/create 0 1 0))
;; (v/mag (v/random-unit))
;; (v/random-unit)
;; (defvar v (v/random-disk) )
;; (v/random-disk)
;; (> (v/dot v v) 1)
;; (v/rotate-x (v/create 0 1 0) m_pi)
;; (v/average-colors (list (v/create 1 1 1) (v/create 2 2 2) (v/create 1 1 1)))

;; (s/create (v/create 1 1 1) 2)
;; (pow 3 2)
(defun addone (x) (+ x 1))
(map addone (reverse (range 10) ))
;; (list (+ 3 2) (+ 3 2) (+ 3 2))
(defun repeat (i c) (map (lambda (x) i) (range c)))
(defvar lng 100)
(defun apply_binom (f b) (f (car b) (cadr b)))
(map (lambda (x) (apply_binom + x)) (pair (range lng) (reverse (range lng))))
