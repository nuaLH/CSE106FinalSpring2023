import json
import random
from urllib import request
from flask import Flask, jsonify, redirect, url_for, request, render_template, session, request, Response
from flask_sqlalchemy import SQLAlchemy
from datetime import timedelta
from flask_login import LoginManager, UserMixin, current_user, login_user, logout_user, login_required
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from datetime import datetime
import urllib.parse
import pytz


app = Flask(__name__, template_folder='templates', static_folder='static')

# Database Configuration
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///logIn.sqlite3"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# set optional bootswatch theme
app.config['FLASK_ADMIN_SWATCH'] = 'cerulean'

db = SQLAlchemy(app)


# Flask-Login Configuration
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'
app.secret_key = 'kepp it secret, keep it safe'


# User Model
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False)
    password = db.Column(db.String(100), nullable=False)
    nickname = db.Column(db.String(100), nullable=False)

    def get_id(self):
        return self.id

    def check_password(self, password):
        return self.password == password

# links a userid with another userid


class Follower(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    follower_id = db.Column(
        db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', foreign_keys=[
                           follower_id], backref=db.backref('following', lazy='dynamic'))
    follower = db.relationship('User', foreign_keys=[
                               user_id], backref=db.backref('followers', lazy='dynamic'))


# links the userid with their post
pytz.timezone('America/Los_Angeles')


class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    content = db.Column(db.String(1000), nullable=False)
    date = db.Column(db.DateTime, nullable=False, default=datetime.now(
        pytz.timezone('America/Los_Angeles')))
    likes = db.Column(db.Integer, nullable=False, default=0)
    user = db.relationship('User', backref=db.backref('posts', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'username': self.user.username,
            'nickname': self.user.nickname,
            'content': self.content,
            'date': self.date
        }


class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False)
    comment_field = db.Column(db.String(1000), nullable=False)


class Like(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False)
    user = db.relationship('User', backref=db.backref('likes', lazy=True))


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


@app.route('/')
def start():
    return render_template("login.html")


# @app.route('/registerpage')
# def registerpage():
#     return render_template("login.html")


@app.route('/register', methods=['POST'])
def register():
    if request.method == 'POST':
        data = request.json
        username = data['username']
        nickname = data['nickname']
        password = data['password']
        confirm = data['confirm']
        user = User.query.filter_by(username=username).first()
        if user:
            return jsonify({'error': 'User already exists'})
        elif confirm != password:
            return jsonify({'error': 'Confirmation password not the same'})
        else:
            user = User(username=username,
                        password=password, nickname=nickname)
            db.session.add(user)
            db.session.commit()
            return jsonify({'redirect': url_for('start')})


@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data['username']).first()
    if user is None or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid username or password'})
    else:
        login_user(user)
        return jsonify({'redirect': url_for('homepage')})


@app.route('/home')
@login_required
def home():
    return jsonify({'redirect': url_for('homepage')})


@app.route('/homepage')
@login_required
def homepage():
    follower_ids = [f.follower_id for f in current_user.followers]
    print(follower_ids)
    follower_ids.append(current_user.id)
    # filters post of the user as well as the users that the user follows
    posts = Post.query.filter(Post.user_id.in_(
        follower_ids)).order_by(Post.date.desc()).all()
    print(posts)
    username = current_user.username
    nickname = current_user.nickname

    # posts=posts... left hand side is for html, right hand side is for python
    # return render_template('home.html', posts=posts, nickname=nickname, username=username)
    return render_template('home.html', posts=posts, nickname=nickname, username=username)


@app.route('/profile')
@login_required
def profile():
    following = 0
    follower = 0
    user_id = request.args.get('id')
    print(user_id)
    if user_id.isdigit():  # if given a user_id
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'})
        posts = Post.query.filter_by(
            user_id=user_id).order_by(Post.date.desc()).all()
    else:  # if given a username
        user = User.query.filter_by(username=user_id).first()
        if not user:
            return jsonify({'error': 'User not found'})
        posts = Post.query.filter_by(
            user_id=user.id).order_by(Post.date.desc()).all()
    for f in user.followers:
        following += 1
    for f in user.following:
        follower += 1
    followids = [follower.user_id for follower in user.following]
    return render_template('profile.html', user=user, posts=posts, following=following, follower=follower, followids=followids)


@app.route('/post', methods=['POST'])
@login_required
def post():
    data = request.json
    # grab content data and remove %20
    content = urllib.parse.unquote(data['content'])
    if not content:
        return jsonify({'error': 'Content cannot be empty'})
    # creates post connected with user
    post = Post(user_id=current_user.id, content=content)
    db.session.add(post)
    db.session.commit()
    return jsonify({'success': 'nice'})


@app.route('/follow', methods=['POST'])
@login_required
def follow():
    data = request.json
    user_id = data['user_id']
    # check if the user is already following the given user
    if Follower.query.filter_by(user_id=current_user.id, follower_id=user_id).first():
        return jsonify({'error': 'Already following'})

    # create a new follower relationship
    follower = Follower(user_id=current_user.id, follower_id=user_id)
    db.session.add(follower)
    db.session.commit()

    return jsonify({'success': 'cool'})


@app.route('/unfollow', methods=['POST'])
@login_required
def unfollow():
    data = request.json
    user_id = data['user_id']
    # find the follower relationship to delete
    follower = Follower.query.filter_by(
        user_id=current_user.id, follower_id=user_id).first()
    if follower:
        db.session.delete(follower)
        db.session.commit()

    return jsonify({'success': 'cool'})


@app.route('/following')
@login_required
def following():
    user_id = request.args.get('id')
    print(user_id)
    user = User.query.get(user_id)
    # finds users following the user
    following_ids = [f.follower_id for f in user.followers]
    print(following_ids)
    # filters users that have the same id as the following users
    following = User.query.filter(User.id.in_(following_ids)).all()
    print(following)
    state = "Following"
    return render_template('follow.html', users=following, state=state)


@app.route('/followers')
@login_required
def followers():
    user_id = request.args.get('id')
    print(user_id)
    user = User.query.get(user_id)
    # finds users that are followers of the user
    follower_ids = [f.user_id for f in user.following]
    print(follower_ids)
    # filters users that have the same id as the followers
    follower = User.query.filter(User.id.in_(follower_ids)).all()
    state = "Followers"
    return render_template('follow.html', users=follower, state=state)


@app.route('/likes', methods=['POST'])
@login_required
def likepost():
    # grabs the post id
    post_id = request.json['post_id']
    # grabs post that is associated with the id
    post = Post.query.get(post_id)

    # matches the userid to the post id and
    # queries the database to the row that matches the arguments
    like = Like.query.filter_by(
        post_id=post_id, user_id=current_user.id).first()

    # Handle the decision if the post is already liked by the user
    if like:
        post.likes -= 1
        db.session.delete(like)
        db.session.commit()
    else:
        post.likes += 1
        # "Insert" SQL Statement here
        newLike = Like(user_id=current_user.id, post_id=post_id)
        db.session.add(newLike)
        db.session.commit()

    # return the count from the model
    return jsonify({'likes': post.likes})


@app.route('/comment', methods=['POST'])
@login_required
def comment():
    # grabbing the post id
    post_id = request.json['post_id']

    # grabbing the content of the comment from javascript function
    comment = request.json['comment']

    # creating an instance to add into database
    dbcomment = Comment(comment_field=comment,
                        user_id=current_user.id, post_id=post_id)

    # add into the database
    db.session.add(dbcomment)

    # commit changes
    db.session.commit()

    # troubleshooting
    print(dbcomment)

    return jsonify({'comment': comment})

# load the users in a list


@app.route('/loadusers', methods=['GET'])
@login_required
def loadusers():
    accounts = User.query.all()
    output = []

    for i in accounts:
        output.append(i.username)

    return jsonify(output)


@app.route('/deletepost', methods=['POST'])
@login_required
def deletepost():
    data = request.json
    post_id = data['post_id']
    post = Post.query.filter_by(id=post_id).first()
    if post is None:
        return jsonify({'error': 'Post not found'})
    if post.user != current_user:
        return jsonify({'error': 'You are not authorized to delete this post'})
    db.session.delete(post)
    db.session.commit()
    return jsonify({'success': 'cool'})


@app.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'redirect': url_for('start')})


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
