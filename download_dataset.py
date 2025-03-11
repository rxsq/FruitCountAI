from roboflow import Roboflow

rf = Roboflow(api_key="FelkDt3u0CkczBaRuMWn")  

project = rf.workspace("andrews-workspace-q2cfv").project("fruitcountai")

dataset = project.version(1).download("yolov8")
