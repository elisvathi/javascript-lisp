(defun cadr (a)
  (car (cdr a)))
(defun caar (a)
  (car (car a)))
(defun caddr (a)
  (car (cdr (cdr a))))
(defun caddar (a)
  (car (cdr (cdr (car a)))))
(defun cdar (a)
  (cdr (car a)))
(defun cadar (a)
  (car (cdr (car a))))

(defun null x
  (eq x '()))

;; Boolean and
(defun and (x y)
  (cond
   (x (cond
       (y 't)
       ('t
        '()))
      ('t
       '()))))

;; Boolean or
(defun or (x y)
  (cond
   (x x)
   ('t y)))

;; Boolean not
(defun not (x)
  (cond
   (x '())
   ('t 't)))

(defun append (x y)
  (cond
   ((null x) y)
   ('t
    (cons (car x) (append (cdr x)
                          y)))))

;; Zip two lists
(defun pair (x y)
  (cond
   ((and (null x)
         (null y)) '())
   ((and (not (atom x))
         (not (atom y)))
    (cons (list (car x)
                (car y)) (pair (cdr x)
                (cdr y))))))

;; Find item in assoc list
(defun assoc (x y)
  (cond
   ((eq (caar y) x)
    (cadar y))
   ('t
    (assoc x (cdr y)))))

(defun eval (e a)
  (cond
   ((atom e)
    (assoc e a))
   ((atom (car e))
    (cond
     ((eq (car e) 'quote)
      (cadr e))
     ((eq (car e) 'atom)
      (atom (eval (cadr e)
                  a)))
     ((eq (car e) 'eq)
      (eq (eval (cadr e)
                a) (eval (caddr e)
                a)))
     ((eq (car e) 'car)
      (car (eval (cadr e)
                 a)))
     ((eq (car e) 'cdr)
      (cdr (eval (cadr e)
                 a)))
     ((eq (car e) 'cons)
      (cons (eval (cadr e)
                  a) (eval (caddr e)
                  a)))
     ((eq (car e) 'cond)
      (evcon (cdr e)
             a))
     ('t
      (eval (cons (assoc (car e) a) (cdr e))
            a))))
   ((eq (caar e) 'label)
    (eval (cons (caddar e) (cdr e))
          (cons (list (cadar e)
                      (car e)) a)))
   ((eq (caar e) 'lambda)
    (eval (caddar e)
          (append (pair (cadar e)
                        (evlis (cdr e)
                               a))
                  a)))))

(defun evcon (c a)
  (cond
   ((eval (caar c)
          a)
    (eval (cadar c)
          a))
   ('t
    (evcon (cdr c)
           a))))

(defun evlis (m a)
  (cond
   ((null m) '())
   ('t
    (cons eval (car m)
          a)
    (evlis (cdr m)
           a))))

(defun add (a b)
  (+ a b))
(defun sub (a b)
  (- a b))
(defun mul (a b)
  (* a b))

(defun div (a b)
  (cond
   ((< a b) 0)
   ('t
    (+ 1
       (div (- a b)
            b)))))

(defun mod (a b)
  (let (d (div a b))
          (- a (* d b))))

(defun map (fn l)
  (cond
   ((eq l '()) '())
   ('t
    (cons (fn (car l)) (map fn
                            (cdr l))))))

(defun reduce (fn l i)
  (cond
   ((atom l) i)
   ('t
    (reduce fn
            (cdr l)
            (fn i
                (car l))))))

(defun length (l)
  (cond
   ((atom l) '0)
   ('t
    (+ '1
       (length (cdr l))))))

(defun range (a)
  (cond
   ((eq '0 a) '())
   ('t
    (append (range (- a '1))
            (list (- a '1))))))

(defun sum (a)
  (reduce (lambda (accum item)
            (+ accum item))
          a
          0))

(defun prod (a)
  (reduce (lambda (accum item)
            (* accum item))
          a
          1))

(defun get-element (l i)
  (cond
   ((atom l) '())
   ((< i '0) '())
   ((eq i '0)
    (car l))
   ('t
    (get-element (cdr l)
                 (- i '1)))))

(defun reverse (a)
  (cond
   ((atom a) '())
   ('t
    (append (reverse (cdr a))
            (list (car a))))))

(defun foldl (a b c)
  (reduce a b c))

(defun foldr (f l ac)
  (reduce f
          (reverse l)
          ac))

(defun take (s a)
  (cond
   ((eq s '0) '())
   ((null a) '())
   ('t
    (cons (car a) (take (- s '1)
                        (cdr a))))))

(defun drop (s a)
  (cond
   ((eq s '0) a)
   ((null a) '())
   ('t
    (drop (- s '1)
          (cdr a)))))

(defun merge (a b)
  (cond
   ((null a) b)
   ((null b) a)
   ('t
    (cond
     ((<= (car a) (car b))
      (cons (car a) (merge (cdr a)
                           b)))
     ('t
      (cons (car b) (merge a
                           (cdr b))))))))
(defun msort (a)
  (cond
   ((null a) '())
   ((null (cdr a)) a)
   ('t
    (merge (msort (take (div (length a)
                             2)
                        a))
           (msort (drop (div (length a)
                             2)
                        a))))))

(defun = (a b)
  (eq a b))

(defun filter (f a)
  (cond
   ((eq a '()) a)
   ('t
    (let (first (f (car a)))
      (cond
       ((eq first '())
        (filter f
                (cdr a)))
       ('t
        (cons (car a) (filter f
                            (cdr a)))))))))

(defun if (exp then else) (cond (exp then) ('t else)))
