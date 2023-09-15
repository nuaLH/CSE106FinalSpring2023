# CSE106FinalProject

Developing a Twitter clone (web app name still conclusive)

## If you wanna use a python enviroment: [Creating a Python environments in VS Code](https://code.visualstudio.com/docs/python/environments)

### Windows
You can also use `py -3 -m venv .venv`
```bash
python -m venv .venv
```

### macOS/Linux
You may need to run `sudo apt-get install python3-venv` first on Debian-based OSs
```bash
python3 -m venv .venv
```

### Activate/deactivate a virtual environment
To activate a virtual environment, type:
```bash
.venv/Scripts/activate
```

To deactivate a virtual environment, type:
```bash
deactivate
```


## Dependencies Installation

IMPORTANT: Activate your virtual environment first if your using one

Example terminal:
```bash
(.venv) PS C:\...
```

Use the package manager [pip](https://pip.pypa.io/en/stable/) to install dependencies.

```bash
pip install Flask
```
```bash
pip install Flask-SQLAlchemy
```
```bash
pip install Flask-Login
```
```bash
pip install Flask-Admin
```

Once all Dependencies are installed use the run button when clicking on your .py file