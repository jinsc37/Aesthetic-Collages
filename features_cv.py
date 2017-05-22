#import cv2
import numpy as np
from matplotlib import pyplot as plt
from skimage.morphology import disk
from skimage.filters.rank import gradient
from skimage import io, color
from skimage.exposure import histogram
from skimage.feature import canny
from pyemd import emd
from scipy.stats import entropy
from scipy.stats import skew

def getSharpness(img):
	selection_element = disk(5) # matrix of n pixels with a disk shape
	grad = gradient(img, selection_element)
	#plt.imshow(grad, cmap="viridis")
	#plt.axis('off')
	#plt.colorbar()
	#plt.show()

	return np.mean(grad)

def getColorful(img):
	if len(img.shape) == 3:
		img2D = np.reshape(img, (1,img.shape[0]*img.shape[1],3))
	else:
		img = color.gray2rgb(img)
		img2D = np.reshape(img, (1,img.shape[0]*img.shape[1],3))

	centers = np.empty([1,0,3], dtype=np.uint8) # make the empty centers vector
	bin_idxs = np.array([32, 96, 160, 224], dtype=np.uint8) # bin center locations
	for r in bin_idxs: # assign the center pixel values
		for g in bin_idxs:
			for b in bin_idxs:
				centers = np.append(centers, np.array([[[r,g,b]]]), axis=1)

	centers_luv = color.rgb2luv(centers)

	dist = np.empty([64,64])
	for i in range(64):
		for j in range(64):
			dist[i,j] = np.sqrt(np.sum((centers_luv[0][i] - centers_luv[0][j]) ** 2))

	img2D = np.reshape(img, (img.shape[0]*img.shape[1],3))
	H, _ = np.histogramdd(img2D, bins = 4)
	D_count = np.reshape(H, 64).astype(np.float64)

	D_img = D_count/img2D.shape[0]
	D_uni = (np.ones(64)/64.0).astype(np.float64)

	discolorfulness = emd(D_img, D_uni, dist)

	return discolorfulness

def getTone(img, top_p = 0.3):
	hist = histogram(img)
	num_pix = img.shape[0]*img.shape[1]
	#plt.plot(hist[1],hist[0])
	#plt.show()

	hist_t = np.copy(hist[0]) # copy values (not share instance)
	curr_sum = 0
	tonal_range = []

	# Add max values until 30% occurance is reached, recording the locations (30% in volume range)
	while curr_sum < num_pix*top_p:
		max_val = np.amax(hist_t)
		loc =  np.argmax(hist_t)

		curr_sum = curr_sum + max_val
		tonal_range.append(loc)

		hist_t[loc] = 0

	return np.median(tonal_range)

def getLuminance(img):
	num_pix = img.shape[0]*img.shape[1]

	lumin = np.sum(img)/num_pix

	return lumin
	'''
	img = io.imread(img)
	num_pix = img.shape[0]*img.shape[1]

	r = img[:,:,0]
	g = img[:,:,1]
	b = img[:,:,2]

	lumin = 0.2126*np.sum(r) + 0.7152*np.sum(g) + 0.0722*np.sum(b)
	print lumin'''

def getContrast(img):
	std = np.std(img)

	return std

def getEntropy(img):
	hist = histogram(img)

	ent = entropy(hist[0])

	return ent

def getUniformity(img, top_p = 0.05):
	hist = histogram(img)
	num_pix = img.shape[0]*img.shape[1]

	hist_t = np.copy(hist[0]) # copy values (not share instance)
	curr_sum = 0

	# Add max values until 5% of top-occuring pixel values is reached (5% in 256-range)
	num_top_vals = int(round(256*top_p))
	for i in range(num_top_vals):
		max_val = np.amax(hist_t)
		loc =  np.argmax(hist_t)
		curr_sum = curr_sum + max_val

		hist_t[loc] = 0

	occur_ratio = curr_sum/float(num_pix)

	return occur_ratio

def getExpBal(img):
	hist = histogram(img)
	skewness = skew(hist[0])

	return skewness

def getTexture(img):
	edges = canny(img)
	texture = np.mean(edges)

	return texture

def getSize(img):
	num_pix = img.shape[0]*img.shape[1]

	return num_pix


def getFeatures(img_file):
	#img_g = cv2.imread(img_file,0) # gray
	img_g = io.imread(img_file, as_grey=True)
	img_c = io.imread(img_file)

	sharp = getSharpness(img_g)
	discolor = getColorful(img_c)
	tone = getTone(img_g)
	lumin = getLuminance(img_g)
	contr = getContrast(img_g)
	entropy = getEntropy(img_g)
	uniform = getUniformity(img_g)
	expbal = getExpBal(img_g)
	texture = getTexture(img_g)
	imgSize = getSize(img_g)

	return sharp, discolor, tone, lumin, contr, entropy, uniform, expbal, texture, imgSize


def getFeatures_web(img_c):
	img_g = color.rgb2gray(img_c)

	sharp = getSharpness(img_g)
	discolor = getColorful(img_c)
	tone = getTone(img_g)
	lumin = getLuminance(img_g)
	contr = getContrast(img_g)
	entropy = getEntropy(img_g)
	uniform = getUniformity(img_g)
	expbal = getExpBal(img_g)
	texture = getTexture(img_g)
	imgSize = getSize(img_g)

	return sharp, discolor, tone, lumin, contr, entropy, uniform, expbal, texture, imgSize

'''
img_file = 'img1.jpg'
img_g = io.imread(img_file, as_grey=True)
img_c = io.imread(img_file)

print type(img_c)
'''
#C = getColorful('../data/AVA_images_originalSize/1000.jpg')
#print C