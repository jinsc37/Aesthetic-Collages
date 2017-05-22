from flask import Flask, render_template, request, jsonify
from features_cv import getFeatures_web
import numpy as np
from scipy import stats
from PIL import Image
import base64
import re
import cStringIO
import json

from datetime import timedelta
from flask import make_response, request, current_app
from functools import update_wrapper
def crossdomain(origin=None, methods=None, headers=None, max_age=21600,
                attach_to_all=True, automatic_options=True):
    """Decorator function that allows crossdomain requests.
      Courtesy of
      https://blog.skyred.fi/articles/better-crossdomain-snippet-for-flask.html
    """
    if methods is not None:
        methods = ', '.join(sorted(x.upper() for x in methods))
    if headers is not None and not isinstance(headers, basestring):
        headers = ', '.join(x.upper() for x in headers)
    if not isinstance(origin, basestring):
        origin = ', '.join(origin)
    if isinstance(max_age, timedelta):
        max_age = max_age.total_seconds()

    def get_methods():
        """ Determines which methods are allowed
        """
        if methods is not None:
            return methods

        options_resp = current_app.make_default_options_response()
        return options_resp.headers['allow']

    def decorator(f):
        """The decorator function
        """
        def wrapped_function(*args, **kwargs):
            """Caries out the actual cross domain code
            """
            if automatic_options and request.method == 'OPTIONS':
                resp = current_app.make_default_options_response()
            else:
                resp = make_response(f(*args, **kwargs))
            if not attach_to_all and request.method != 'OPTIONS':
                return resp

            h = resp.headers
            h['Access-Control-Allow-Origin'] = origin
            h['Access-Control-Allow-Methods'] = get_methods()
            h['Access-Control-Max-Age'] = str(max_age)
            h['Access-Control-Allow-Credentials'] = 'true'
            h['Access-Control-Allow-Headers'] = \
                "Origin, X-Requested-With, Content-Type, Accept, Authorization"
            if headers is not None:
                h['Access-Control-Allow-Headers'] = headers
            return resp

        f.provide_automatic_options = False
        return update_wrapper(wrapped_function, f)
    return decorator



app = Flask(__name__)
app.config["DEBUG"] = True


@app.route('/')
@crossdomain(origin='*')
def index():
	return render_template("test.html")
    #return render_template("template.html")



@app.route('/getRanks', methods=['POST', 'OPTIONS'])
@crossdomain(origin='*')
def getFeat():
	if request.method == "POST":
		feat_mat = []
		image_b64 = request.json

		#print image_b64['0']
		#return jsonify(image_b64)

		for idx in range(len(image_b64)):
			image_data = re.sub('^data:image/.+;base64,', '', image_b64[str(idx)]).decode('base64')
			image_PIL = Image.open(cStringIO.StringIO(image_data))
			image_np = np.array(image_PIL)
			image_url = image_np[:,:,0:3]

			feat = getFeatures_web(image_url)
			feat_mat.append(feat)

		feat_mat = np.asarray(feat_mat)
		#print feat_mat
		scores = getScore(feat_mat)
		#print scores
		ranked_idx = sorted(range(len(scores)), key=lambda k: scores[k], reverse=True)

		try:
			return jsonify({"ranked_idx": ranked_idx})

		except Exception as e:
			return jsonify({"err": e})


def getScore(feat_mat):
	score_mat = []
	weight = np.asarray([1,1,-1,0,0,-1,1,1,1,1])
	for idx in range(len(feat_mat[0])):
		sub_score = stats.zscore(feat_mat[:,idx]) * weight[idx]
		score_mat.append(sub_score)

	scores = np.sum(score_mat, axis=0)
	return scores



@app.route('/hook', methods=['POST', 'OPTIONS'])
@crossdomain(origin='*')
def get_image():
	image_b64 = request.values['imageBase64']
	#print image_b64
	image_data = re.sub('^data:image/.+;base64,', '', image_b64).decode('base64')
	image_PIL = Image.open(cStringIO.StringIO(image_data))
	image_np = np.array(image_PIL)
	print 'Image type: {}'.format(type(image_np))
	print 'Image received: {}'.format(image_np.shape)
	print image_np[0:5,0:5,3]
	return ''


if __name__ == '__main__':
    app.run()