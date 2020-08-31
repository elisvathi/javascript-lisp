(require examples/raytracer/vector.lisp)
(require examples/raytracer/ray.lisp)

(defun c/create (pos dir rght dn ang apert)
  (pair (list 'position 'direction 'right 'down 'angle
              'aperture)
        (list pos dir rght dn ang apert)))

(defun c/position (c) (assoc 'position c))
(defun c/direction (c) (assoc 'direction c))
(defun c/right (c) (assoc 'right c))
(defun c/down (c) (assoc 'down c))
(defun c/angle (c) (assoc 'angle c))
(defun c/aperture (c) (assoc 'aperture c))

(defun c/origin-ray (c aspect x y)
  (let (rand-dir (v/scale (v/random-disk) (c/aperture c)))
    ()))
