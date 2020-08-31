(require stdlib.lisp)
(require native.lisp)

(defun v/create (a b c)
  (pair (list 'x 'y 'z)
        (list a b c)))

(defun v/x (v)
  (assoc x v))

(defun v/y (v)
  (assoc y v))

(defun v/z (v)
  (assoc z v))

(defun v/op (op first second)
  (v/create (op (assoc 'x first)
                (assoc 'x second))
            (op (assoc 'y first)
                (assoc 'y second))
            (op (assoc 'z first)
                (assoc 'z second))))

(defun v/add (first second)
  (v/op + first second))

(defun v/sub (first second)
  (v/op - first second))

(defun v/mult (first second)
  (v/op * first second))

(defun v/div (first second)
  (v/op / first second))

(defun v/scale (v value)
  (v/create (* (v/x v)
               value)
            (* (v/y v)
               value)
            (* (v/z v)
               value)))

(defun v/mag (v)
  (sqrt (+ (+ (* (v/x v)
                 (v/x v))
              (* (v/y v)
                 (v/y v)))
           (* (v/z v)
              (v/z v)))))

(defun v/set-mag (v value)
  (v/scale v
           (/ value
              (v/mag v))))

(defun v/dot (first second)
  (+ (* (v/x first)
        (v/x second))
     (+ (* (v/y first)
           (v/y second))
        (* (v/z first)
           (v/z second)))))

(defun v/sum-squares (v)
  (+ (* (v/x v)
        (v/x v))
     (+ (* (v/y v)
           (v/y v))
        (* (v/z v)
           (v/z v)))))

(defun v/angle-between (first second)
  (acos (/ (v/dot first second)
           (sqrt (* (v/sum-squares first)
                    (v/sum-squares second))))))

(defun v/normal (v)
  (v/set-mag v 1))

(defun v/inverse (v)
  (v/scale v -1))

(defun v/reflect (first norm)
  (v/inverse (v/sub (v/scale norm
                             (* (v/dot norm first)
                                2))
                    first)))

(defun v/refract (first norm ni_over_nt)
  (let ((uv (v/normal first))
        (dt (v/dot uv norm))
        (discriminant (- 1
                         (* (* ni_over_nt ni_over_nt)
                            (- 1
                               (* dt dt))))))
    (if (> discriminant 0)
        (v/sub (v/scale (v/sub uv
                               (v/scale norm dt))
                        ni_over_nt)
               (v/scale norm
                        (sqrt discriminant)))
      '())))

(defun v/cross (first second)
  (v/create (- (* (v/y first)
                  (v/z second))
               (* (v/z first)
                  (v/y second)))
            (- (* (v/z first)
                  (v/x second))
               (* (v/x first)
                  (v/z second)))
            (- (* (v/x first)
                  (v/y second))
               (* (v/y first)
                  (v/x second)))))

(defun v/rotate-x (v angle)
  (v/create (v/x v)
            (- (* (v/y v)
                  (cos angle))
               (* (v/z v)
                  (sin angle)))
            (+ (* (v/y v)
                  (sin angle))
               (* (v/z v)
                  (cos angle)))))

(defun v/rotate-y (v angle)
  (v/create (+ (* (v/x v)
                  (cos angle))
               (* (v/z v)
                  (sin angle)))
            (v/y v)
            (+ (* -1
                  (* (v/x v)
                     (sin angle)))
               (* (v/z v)
                  (cos angle)))))

(defun v/rotate-z (v angle)
  (v/create (- (* (v/x v)
                  (cos angle))
               (* (v/z v)
                  (sin angle)))
            (+ (* (v/x v)
                  (sin angle))
               (* (v/y v)
                  (cos angle)))
            (v/z v)))

(defun v/random-unit ()
  (let ((v (v/create 1 0 0)))
    (v/rotate-x (v/rotate-y (v-rotate-z v
                                        (* (* 2 m_pi)
                                           (random)))
                            (* (* 2 m_pi)
                               (random)))
                (* (* 2 m_pi)
                   (random)))))


(defun v/random-disk ()
  (let ((p (v/sub (v/scale (v/create (random)
                                     (random)
                                     0)
                           2)
                  (v/create 1 1 0))))
    (cond
     (eq (v/dot p p) '())
     (v/random-disk)
     ('t p))))

(defun v/average-colors (colors)
  (let ((r (map v/x colors))
        (g (map v/y colors))
        (b (map v/z colors))
        (sum_r (sum r))
        (sum_g (sum g))
        (sum_b (sum b))
        (len (length colors)))
    (v/create (/ sum_r len)
              (/ sum_g len)
              (/ sum_b len))))
