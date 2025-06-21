import unittest
from unittest.mock import patch

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

    def on(self):
        print('on')
        
    def off(self):
        print('off')
            
    def status(self):
        return self.state
    

onOFFAutoController = OnOFFAutoController()

onOFFAutoController.setState("ON")
    
print(onOFFAutoController.state)

class TestOnOFFAutoController(unittest.TestCase):
    def setUp(self):
        self.controller = OnOFFAutoController()

    def test_initial_state(self):
        self.assertEqual(self.controller.state, OnOffState.AUTO)

    def test_set_state_on(self):
        with patch.object(self.controller, 'on', return_value=None) as mock_on:
            with patch.object(self.controller, 'off', return_value=None):
                self.controller.setState("ON")
                self.assertEqual(self.controller.state, OnOffState.ON)
                mock_on.assert_called_once()

    def test_set_state_off(self):
        with patch.object(self.controller, 'on', return_value=None):
            with patch.object(self.controller, 'off', return_value=None) as mock_off:
                self.controller.setState("OFF")
                self.assertEqual(self.controller.state, OnOffState.OFF)
                mock_off.assert_called_once()

    def test_set_state_invalid(self):
        prev_state = self.controller.state
        self.controller.setState("INVALID")
        self.assertEqual(self.controller.state, prev_state)

    def test_status(self):
        self.assertEqual(self.controller.status(), OnOffState.AUTO)
        self.controller.state = OnOffState.ON
        self.assertEqual(self.controller.status(), OnOffState.ON)

if __name__ == "__main__":
    unittest.main()