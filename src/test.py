
class OnOffState():
    ON = "ON"
    OFF = "OFF"
    AUTO = "AUTO"
    
class OnOFFAutoController:
    
    state = OnOffState.AUTO
        
    def setState(self, state):
        
        if not hasattr(OnOffState, state) : 
            print('**Invalid state:' + str(state))
            return
        
        print('**Set state:' + str(self.state) + "->" + str(state))
        
        if (state == OnOffState.ON):
            self.on()
        elif (state == OnOffState.OFF):
            self.off()
        #elif (state == OnOffState.AUTO):
            # Do nothing               
   
        self.state = state                    
            
    def status(self):
        return self.state
    

onOFFAutoController = OnOFFAutoController()

onOFFAutoController.setState("ON")
    
print(onOFFAutoController.state)