from fastapi import HTTPException, UploadFile , File,FastAPI
from fastapi.responses import StreamingResponse
import torch
import torch.nn as nn
from torchvision import transforms
from PIL import Image
from torchvision.datasets import ImageFolder
from io import BytesIO
import json
from fastapi.middleware.cors import CORSMiddleware
device=torch.device('cuda' if torch.cuda.is_available() else 'cpu')
app=FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# creating model
class my_cnn(nn.Module):
    def __init__(self,num_feature,num_classes):
        super().__init__()
        
        self.features=nn.Sequential(
            nn.Conv2d(num_feature,64,kernel_size=3,stride=2,padding=1),
            nn.ReLU(),
            nn.BatchNorm2d(64),
            nn.MaxPool2d(kernel_size=2, stride=2),
            
            nn.Conv2d(64,128,kernel_size=3,stride=2,padding=1),
            nn.ReLU(),
            nn.BatchNorm2d(128),
            nn.MaxPool2d(kernel_size=2, stride=2),
            
            nn.Conv2d(128,256,kernel_size=3,stride=2,padding=1),
            nn.ReLU(),
            nn.BatchNorm2d(256),
            nn.MaxPool2d(kernel_size=2, stride=2),
            
            nn.AdaptiveAvgPool2d((1, 1))
            )
       
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(256, 512),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, num_classes)
        )
    def forward(self,x):
        output=self.features(x)
        output=self.classifier(output)
    
        return output


with open("class_names.json","r") as f:
    class_names=json.load(f)
   
model=my_cnn(3,len(class_names))          
state_dict=torch.load("fruit_classification.pth", map_location=device, weights_only=False)
model.load_state_dict(state_dict)
model.to(device)
model.eval()



@app.get("/")
def home():
    return{
        "Message":"This model can predict different types of fruit and vegetable",
        "Message": "Running",
        "Endpoint": "Send post request to predict"
    }   
    
@app.post("/predict")
async def predict(file :UploadFile=File(...)):
    if not  file.filename.lower().endswith((".png",".jpg",".jpeg")):
        raise HTTPException(
            status_code=400,
            detail="please upload a JPG / PNG/ JPEG file"
        )
    else:
        content=await file.read()
        image=Image.open(BytesIO(content)).convert("RGB")
        transform=transforms.Compose([
            transforms.Resize((128,128)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485,0.456,0.406],
                std=[0.229,0.224,0.225]
            )
        ])
        image_tensor=transform(image)
        image_tensor=image_tensor.unsqueeze(0).to(device)
        
        with torch.no_grad():
            output=model(image_tensor)
            
            probabilities=torch.softmax(output,dim=1)
            predicted_class=torch.argmax(probabilities, dim=1).item()
            confidence = probabilities[0][predicted_class].item() * 100
            fruit_name = class_names[predicted_class]
            return {
                "Fruit":fruit_name,
                "Confidence" :f"{round(confidence,2)}%"
            }
            
            
        
        
        
        
        
        
    
    
    









