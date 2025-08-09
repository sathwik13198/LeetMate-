# Test Python file for syntax highlighting

def example_function(param1, param2):
    """This is a docstring."""
    # This is a comment
    result = param1 + param2
    return result

class ExampleClass:
    def __init__(self, value):
        self.value = value
    
    def get_value(self):
        return self.value

# String interpolation
name = "World"
f_string = f"Hello, {name}!"

# List comprehension
numbers = [1, 2, 3, 4, 5]
squares = [x**2 for x in numbers if x % 2 == 0]

if __name__ == "__main__":
    print(example_function(10, 20))
    obj = ExampleClass(42)
    print(obj.get_value())