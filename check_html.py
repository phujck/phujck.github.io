from html.parser import HTMLParser

class MyHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.void_elements = ['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']

    def handle_starttag(self, tag, attrs):
        if tag not in self.void_elements:
            self.stack.append((tag, self.getpos()))

    def handle_endtag(self, tag):
        if tag in self.void_elements:
            return
        if not self.stack:
            print(f"Error: Closing tag <{tag}> at {self.getpos()} without matching open tag")
            return
        last_tag, pos = self.stack.pop()
        if last_tag != tag:
            print(f"Error: Mismatched tag. Expected </{last_tag}> from {pos}, got </{tag}> at {self.getpos()}")

    def check(self):
        if self.stack:
            print(f"Error: Unclosed tags remaining: {self.stack}")
        else:
            print("No unmatched tags found!")

parser = MyHTMLParser()
with open("index.html") as f:
    parser.feed(f.read())
parser.check()
